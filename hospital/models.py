"""
hospital/models.py

Full Django ORM models for the Hospital Management System.
Matches the ER diagram exactly:

  Patient, Employee, Doctor, Nurse, Receptionist,
  Rooms, Test_Report, Bills, Records, Consults,
  Assigned, Governs, Maintains
"""

from django.db import models


# ---------------------------------------------------------------------------
# Patient
# ---------------------------------------------------------------------------
class Patient(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    p_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    age = models.PositiveIntegerField()
    dob = models.DateField()
    mob_no = models.CharField(max_length=15)
    email = models.EmailField(max_length=255, null=True, blank=True, unique=True)

    class Meta:
        db_table = 'patient'
        ordering = ['name']

    def __str__(self):
        return f"Patient({self.p_id}) - {self.name}"


# ---------------------------------------------------------------------------
# Employee  (base for Doctor, Nurse, Receptionist)
# ---------------------------------------------------------------------------
class Employee(models.Model):
    SEX_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    e_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES)
    salary = models.DecimalField(max_digits=12, decimal_places=2)
    mob_no = models.CharField(max_length=15)
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    pin_no = models.CharField(max_length=10)

    class Meta:
        db_table = 'employee'
        ordering = ['name']

    def __str__(self):
        return f"Employee({self.e_id}) - {self.name}"


# ---------------------------------------------------------------------------
# Doctor
# ---------------------------------------------------------------------------
class Doctor(models.Model):
    doctor_id = models.AutoField(primary_key=True)
    e_id = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='doctor_profile',
        db_column='e_id',
    )
    dept = models.CharField(max_length=100)
    qualification = models.CharField(max_length=200)

    class Meta:
        db_table = 'doctor'
        ordering = ['dept']

    def __str__(self):
        return f"Dr. {self.e_id.name} ({self.dept})"


# ---------------------------------------------------------------------------
# Nurse
# ---------------------------------------------------------------------------
class Nurse(models.Model):
    nurse_id = models.AutoField(primary_key=True)
    e_id = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='nurse_profile',
        db_column='e_id',
    )

    class Meta:
        db_table = 'nurse'

    def __str__(self):
        return f"Nurse({self.nurse_id}) - {self.e_id.name}"


# ---------------------------------------------------------------------------
# Receptionist
# ---------------------------------------------------------------------------
class Receptionist(models.Model):
    receptionist_id = models.AutoField(primary_key=True)
    e_id = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='receptionist_profile',
        db_column='e_id',
    )

    class Meta:
        db_table = 'receptionist'

    def __str__(self):
        return f"Receptionist({self.receptionist_id}) - {self.e_id.name}"


# ---------------------------------------------------------------------------
# Rooms
# ---------------------------------------------------------------------------
class Rooms(models.Model):
    ROOM_TYPE_CHOICES = [
        ('General', 'General'),
        ('Private', 'Private'),
        ('ICU', 'ICU'),
        ('Emergency', 'Emergency'),
        ('Operation Theatre', 'Operation Theatre'),
        ('Maternity', 'Maternity'),
    ]

    r_id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=50, choices=ROOM_TYPE_CHOICES)
    capacity = models.PositiveIntegerField(default=1)
    availability = models.BooleanField(default=True)

    class Meta:
        db_table = 'rooms'
        ordering = ['type']

    def __str__(self):
        status = "Available" if self.availability else "Occupied"
        return f"Room({self.r_id}) - {self.type} [{status}]"


# ---------------------------------------------------------------------------
# Test_Report
# ---------------------------------------------------------------------------
class Test_Report(models.Model):
    report_id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='test_reports',
    )
    room = models.ForeignKey(
        Rooms,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='test_reports',
    )
    test_type = models.CharField(max_length=150)
    result = models.TextField()

    class Meta:
        db_table = 'test_report'
        ordering = ['-report_id']

    def __str__(self):
        return f"Report({self.report_id}) - {self.test_type} for {self.patient.name}"


# ---------------------------------------------------------------------------
# Bills
# ---------------------------------------------------------------------------
class Bills(models.Model):
    b_id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='bills',
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, default='Pending')  # 'Pending' or 'Paid'
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bills'
        ordering = ['-generated_at']

    def __str__(self):
        return f"Bill({self.b_id}) - {self.patient.name} | ₹{self.amount}"


# ---------------------------------------------------------------------------
# Records
# ---------------------------------------------------------------------------
class Records(models.Model):
    record_no = models.AutoField(primary_key=True)
    app_no = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'records'
        ordering = ['record_no']

    def __str__(self):
        return f"Record({self.record_no}) - App No: {self.app_no}"


# ---------------------------------------------------------------------------
# Consults  (Patient <-> Doctor M2M with extra fields)
# ---------------------------------------------------------------------------
class Consults(models.Model):
    consult_id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='consultations',
    )
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='consultations',
    )
    consult_date = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'consults'
        ordering = ['-consult_date']
        unique_together = ('patient', 'doctor', 'consult_date')

    def __str__(self):
        return (
            f"Consult({self.consult_id}) - "
            f"{self.patient.name} with Dr.{self.doctor.e_id.name} "
            f"on {self.consult_date}"
        )


# ---------------------------------------------------------------------------
# Assigned  (Patient assigned to Room)
# ---------------------------------------------------------------------------
class Assigned(models.Model):
    assign_id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='room_assignments',
    )
    room = models.ForeignKey(
        Rooms,
        on_delete=models.CASCADE,
        related_name='patient_assignments',
    )
    assigned_date = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'assigned'
        ordering = ['-assigned_date']

    def __str__(self):
        return (
            f"Assigned({self.assign_id}) - "
            f"{self.patient.name} → Room {self.room.r_id} "
            f"on {self.assigned_date}"
        )


# ---------------------------------------------------------------------------
# Governs  (Nurse governs Rooms)
# ---------------------------------------------------------------------------
class Governs(models.Model):
    govern_id = models.AutoField(primary_key=True)
    nurse = models.ForeignKey(
        Nurse,
        on_delete=models.CASCADE,
        related_name='governed_rooms',
    )
    room = models.ForeignKey(
        Rooms,
        on_delete=models.CASCADE,
        related_name='governing_nurses',
    )

    class Meta:
        db_table = 'governs'
        unique_together = ('nurse', 'room')

    def __str__(self):
        return (
            f"Governs({self.govern_id}) - "
            f"Nurse {self.nurse.e_id.name} → Room {self.room.r_id}"
        )


# ---------------------------------------------------------------------------
# Maintains  (Receptionist maintains Records)
# ---------------------------------------------------------------------------
class Maintains(models.Model):
    maintain_id = models.AutoField(primary_key=True)
    receptionist = models.ForeignKey(
        Receptionist,
        on_delete=models.CASCADE,
        related_name='maintained_records',
    )
    record = models.ForeignKey(
        Records,
        on_delete=models.CASCADE,
        related_name='maintained_by',
    )

    class Meta:
        db_table = 'maintains'
        unique_together = ('receptionist', 'record')

    def __str__(self):
        return (
            f"Maintains({self.maintain_id}) - "
            f"Receptionist {self.receptionist.e_id.name} → "
            f"Record {self.record.record_no}"
        )
