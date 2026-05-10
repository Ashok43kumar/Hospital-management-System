"""
hospital/admin.py

Django Admin interface configuration.
Register all models with custom list displays and search fields.
"""

from django.contrib import admin
from .models import (
    Patient, Employee, Doctor, Nurse, Receptionist,
    Rooms, Test_Report, Bills, Records, Consults,
    Assigned, Governs, Maintains
)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('p_id', 'name', 'gender', 'age', 'mob_no')
    search_fields = ('name', 'mob_no')
    list_filter = ('gender',)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('e_id', 'name', 'sex', 'salary', 'mob_no')
    search_fields = ('name', 'mob_no', 'city')
    list_filter = ('sex', 'state')


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('doctor_id', 'get_employee_name', 'dept')
    search_fields = ('e_id__name', 'dept')
    list_filter = ('dept',)

    def get_employee_name(self, obj):
        return obj.e_id.name
    get_employee_name.short_description = 'Name'
    get_employee_name.admin_order_field = 'e_id__name'


@admin.register(Nurse)
class NurseAdmin(admin.ModelAdmin):
    list_display = ('nurse_id', 'get_employee_name')
    search_fields = ('e_id__name',)

    def get_employee_name(self, obj):
        return obj.e_id.name
    get_employee_name.short_description = 'Name'


@admin.register(Receptionist)
class ReceptionistAdmin(admin.ModelAdmin):
    list_display = ('receptionist_id', 'get_employee_name')
    search_fields = ('e_id__name',)

    def get_employee_name(self, obj):
        return obj.e_id.name
    get_employee_name.short_description = 'Name'


@admin.register(Rooms)
class RoomsAdmin(admin.ModelAdmin):
    list_display = ('r_id', 'type', 'capacity', 'availability')
    search_fields = ('type',)
    list_filter = ('type', 'availability')


@admin.register(Test_Report)
class TestReportAdmin(admin.ModelAdmin):
    list_display = ('report_id', 'patient', 'test_type')
    search_fields = ('patient__name', 'test_type')
    list_filter = ('test_type',)


@admin.register(Bills)
class BillsAdmin(admin.ModelAdmin):
    list_display = ('b_id', 'patient', 'amount', 'generated_at')
    search_fields = ('patient__name',)
    list_filter = ('generated_at',)


@admin.register(Records)
class RecordsAdmin(admin.ModelAdmin):
    list_display = ('record_no', 'app_no')
    search_fields = ('app_no',)


@admin.register(Consults)
class ConsultsAdmin(admin.ModelAdmin):
    list_display = ('consult_id', 'patient', 'doctor', 'consult_date')
    search_fields = ('patient__name', 'doctor__e_id__name')
    list_filter = ('consult_date',)


@admin.register(Assigned)
class AssignedAdmin(admin.ModelAdmin):
    list_display = ('assign_id', 'patient', 'room', 'assigned_date')
    search_fields = ('patient__name', 'room__type')
    list_filter = ('assigned_date',)


@admin.register(Governs)
class GovernsAdmin(admin.ModelAdmin):
    list_display = ('govern_id', 'nurse', 'room')
    search_fields = ('nurse__e_id__name', 'room__type')


@admin.register(Maintains)
class MaintainsAdmin(admin.ModelAdmin):
    list_display = ('maintain_id', 'receptionist', 'record')
    search_fields = ('receptionist__e_id__name', 'record__app_no')
