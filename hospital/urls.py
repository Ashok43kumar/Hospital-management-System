"""
hospital/urls.py

URL configurations for the Hospital Management System API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'patients', views.PatientViewSet)
router.register(r'employees', views.EmployeeViewSet)
router.register(r'doctors', views.DoctorViewSet)
router.register(r'nurses', views.NurseViewSet)
router.register(r'receptionists', views.ReceptionistViewSet)
router.register(r'rooms', views.RoomsViewSet)
router.register(r'test-reports', views.TestReportViewSet)
router.register(r'bills', views.BillsViewSet)
router.register(r'records', views.RecordsViewSet)
router.register(r'consults', views.ConsultsViewSet)
router.register(r'assigned', views.AssignedViewSet)
router.register(r'governs', views.GovernsViewSet)
router.register(r'maintains', views.MaintainsViewSet)

urlpatterns = [
    # Custom Endpoints (must be above router to avoid <pk> conflicts)
    path('patients/admit/', views.admit_patient, name='admit_patient'),
    path('patients/discharge/', views.discharge_patient, name='discharge_patient'),
    path('consults/create/', views.create_consult, name='create_consult'),
    path('patient/<int:pk>/reports/', views.patient_reports, name='patient_reports'),
    path('bills/generate/', views.generate_bill, name='generate_bill'),
    path('employees/add/', views.add_employee, name='add_employee'),

    # Router URLs
    path('', include(router.urls)),
]
