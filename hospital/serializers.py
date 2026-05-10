"""
hospital/serializers.py

DRF ModelSerializers for all hospital models.
Nested serializers are used where necessary to provide full object details
rather than just IDs.
"""

from rest_framework import serializers
from .models import (
    Patient, Employee, Doctor, Nurse, Receptionist,
    Rooms, Test_Report, Bills, Records, Consults,
    Assigned, Governs, Maintains
)


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'


class DoctorSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='e_id', read_only=True)

    class Meta:
        model = Doctor
        fields = ['doctor_id', 'e_id', 'employee_details', 'dept', 'qualification']


class NurseSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='e_id', read_only=True)

    class Meta:
        model = Nurse
        fields = ['nurse_id', 'e_id', 'employee_details']


class ReceptionistSerializer(serializers.ModelSerializer):
    employee_details = EmployeeSerializer(source='e_id', read_only=True)

    class Meta:
        model = Receptionist
        fields = ['receptionist_id', 'e_id', 'employee_details']


class RoomsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rooms
        fields = '__all__'


class TestReportSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    room_details = RoomsSerializer(source='room', read_only=True)

    class Meta:
        model = Test_Report
        fields = ['report_id', 'patient', 'patient_details', 'room', 'room_details', 'test_type', 'result']


class BillsSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)

    class Meta:
        model = Bills
        fields = ['b_id', 'patient', 'patient_details', 'amount', 'generated_at']


class RecordsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Records
        fields = '__all__'


class ConsultsSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='doctor', read_only=True)

    class Meta:
        model = Consults
        fields = ['consult_id', 'patient', 'patient_details', 'doctor', 'doctor_details', 'consult_date']


class AssignedSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    room_details = RoomsSerializer(source='room', read_only=True)

    class Meta:
        model = Assigned
        fields = ['assign_id', 'patient', 'patient_details', 'room', 'room_details', 'assigned_date']


class GovernsSerializer(serializers.ModelSerializer):
    nurse_details = NurseSerializer(source='nurse', read_only=True)
    room_details = RoomsSerializer(source='room', read_only=True)

    class Meta:
        model = Governs
        fields = ['govern_id', 'nurse', 'nurse_details', 'room', 'room_details']


class MaintainsSerializer(serializers.ModelSerializer):
    receptionist_details = ReceptionistSerializer(source='receptionist', read_only=True)
    record_details = RecordsSerializer(source='record', read_only=True)

    class Meta:
        model = Maintains
        fields = ['maintain_id', 'receptionist', 'receptionist_details', 'record', 'record_details']
