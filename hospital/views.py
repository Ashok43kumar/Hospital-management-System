"""
hospital/views.py

API views and viewsets for the Hospital Management System.
Includes CRUD operations and custom logic endpoints.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction

from .models import (
    Patient, Employee, Doctor, Nurse, Receptionist,
    Rooms, Test_Report, Bills, Records, Consults,
    Assigned, Governs, Maintains
)
from .serializers import (
    PatientSerializer, EmployeeSerializer, DoctorSerializer,
    NurseSerializer, ReceptionistSerializer, RoomsSerializer,
    TestReportSerializer, BillsSerializer, RecordsSerializer,
    ConsultsSerializer, AssignedSerializer, GovernsSerializer,
    MaintainsSerializer
)


# ---------------------------------------------------------------------------
# ViewSets for Standard CRUD Operations
# ---------------------------------------------------------------------------

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related('e_id').all()
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def by_department(self, request):
        """GET /api/doctors/by-department/?dept=Cardiology"""
        dept = request.query_params.get('dept')
        if not dept:
            return Response({"error": "Department parameter 'dept' is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        doctors = self.queryset.filter(dept__iexact=dept)
        serializer = self.get_serializer(doctors, many=True)
        return Response(serializer.data)


class NurseViewSet(viewsets.ModelViewSet):
    queryset = Nurse.objects.select_related('e_id').all()
    serializer_class = NurseSerializer


class ReceptionistViewSet(viewsets.ModelViewSet):
    queryset = Receptionist.objects.select_related('e_id').all()
    serializer_class = ReceptionistSerializer


class RoomsViewSet(viewsets.ModelViewSet):
    queryset = Rooms.objects.all()
    serializer_class = RoomsSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'available']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def available(self, request):
        """GET /api/rooms/available/"""
        available_rooms = self.queryset.filter(availability=True)
        serializer = self.get_serializer(available_rooms, many=True)
        return Response(serializer.data)


class TestReportViewSet(viewsets.ModelViewSet):
    queryset = Test_Report.objects.select_related('patient', 'room').all()
    serializer_class = TestReportSerializer


class BillsViewSet(viewsets.ModelViewSet):
    queryset = Bills.objects.select_related('patient').all()
    serializer_class = BillsSerializer


class RecordsViewSet(viewsets.ModelViewSet):
    queryset = Records.objects.all()
    serializer_class = RecordsSerializer


class ConsultsViewSet(viewsets.ModelViewSet):
    queryset = Consults.objects.select_related('patient', 'doctor').all()
    serializer_class = ConsultsSerializer


class AssignedViewSet(viewsets.ModelViewSet):
    queryset = Assigned.objects.select_related('patient', 'room').all()
    serializer_class = AssignedSerializer


class GovernsViewSet(viewsets.ModelViewSet):
    queryset = Governs.objects.select_related('nurse', 'room').all()
    serializer_class = GovernsSerializer


class MaintainsViewSet(viewsets.ModelViewSet):
    queryset = Maintains.objects.select_related('receptionist', 'record').all()
    serializer_class = MaintainsSerializer


# ---------------------------------------------------------------------------
# Custom Logic Endpoints
# ---------------------------------------------------------------------------

@api_view(['POST'])
def admit_patient(request):
    """
    POST /api/patients/admit/
    Assign a patient to an available room and update room availability.
    Payload: {"patient_id": 1, "room_id": 2}
    """
    patient_id = request.data.get('patient_id')
    room_id = request.data.get('room_id')

    if not patient_id or not room_id:
        return Response({"error": "patient_id and room_id are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            patient = Patient.objects.get(pk=patient_id)
            room = Rooms.objects.get(pk=room_id)

            if not room.availability:
                return Response({"error": "Room is not available."}, status=status.HTTP_400_BAD_REQUEST)

            # Assign room
            assignment = Assigned.objects.create(patient=patient, room=room)

            # Check capacity and update availability
            current_assignments = Assigned.objects.filter(room=room).count()
            if current_assignments >= room.capacity:
                room.availability = False
                room.save()

            serializer = AssignedSerializer(assignment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Patient.DoesNotExist:
        return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)
    except Rooms.DoesNotExist:
        return Response({"error": "Room not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def discharge_patient(request):
    """
    POST /api/patients/discharge/
    Remove assignment, free room, and generate final bill.
    Payload: {"patient_id": 1, "base_amount": 5000}
    """
    patient_id = request.data.get('patient_id')
    base_amount = request.data.get('base_amount', 0)

    if not patient_id:
        return Response({"error": "patient_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            patient = Patient.objects.get(pk=patient_id)
            assignments = Assigned.objects.filter(patient=patient)

            if not assignments.exists():
                return Response({"error": "Patient is not assigned to any room."}, status=status.HTTP_400_BAD_REQUEST)

            # Free the rooms and delete assignments
            for assignment in assignments:
                room = assignment.room
                room.availability = True
                room.save()
            assignments.delete()

            # Generate a final bill
            bill = Bills.objects.create(patient=patient, amount=base_amount)
            bill_serializer = BillsSerializer(bill)

            return Response({
                "message": "Patient discharged successfully.",
                "bill": bill_serializer.data
            }, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def create_consult(request):
    """
    POST /api/consults/create/
    Create patient-doctor consultation.
    Payload: {"patient_id": 1, "doctor_id": 1}
    """
    patient_id = request.data.get('patient_id')
    doctor_id = request.data.get('doctor_id')

    if not patient_id or not doctor_id:
        return Response({"error": "patient_id and doctor_id are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        patient = Patient.objects.get(pk=patient_id)
        doctor = Doctor.objects.get(pk=doctor_id)
        
        consult, created = Consults.objects.get_or_create(patient=patient, doctor=doctor)
        
        serializer = ConsultsSerializer(consult)
        if created:
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "Consultation already exists today.", "data": serializer.data}, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)
    except Doctor.DoesNotExist:
        return Response({"error": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def patient_reports(request, pk):
    """
    GET /api/patient/<id>/reports/
    Return patient test reports.
    """
    try:
        patient = Patient.objects.get(pk=pk)
        reports = Test_Report.objects.filter(patient=patient)
        serializer = TestReportSerializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def generate_bill(request):
    """
    POST /api/bills/generate/
    Generate patient bill automatically.
    Payload: {"patient_id": 1, "amount": 1500}
    """
    patient_id = request.data.get('patient_id')
    amount = request.data.get('amount')

    if not patient_id or amount is None:
        return Response({"error": "patient_id and amount are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        patient = Patient.objects.get(pk=patient_id)
        bill = Bills.objects.create(patient=patient, amount=amount)
        serializer = BillsSerializer(bill)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)
