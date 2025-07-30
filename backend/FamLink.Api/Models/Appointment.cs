using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamLink.Api.Models
{
    public class Appointment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        public Guid? ChildId { get; set; }

        [Required]
        public Guid HospitalId { get; set; }

        [StringLength(200)]
        public string? DoctorName { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        [Required]
        [StringLength(100)]
        public string AppointmentType { get; set; } = string.Empty;

        [StringLength(50)]
        public string Status { get; set; } = "Scheduled"; // 'Scheduled', 'Confirmed', 'Completed', 'Cancelled'

        [StringLength(1000)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("ChildId")]
        public virtual Child? Child { get; set; }

        [ForeignKey("HospitalId")]
        public virtual Hospital Hospital { get; set; } = null!;

        [NotMapped]
        public bool IsUpcoming => AppointmentDate > DateTime.UtcNow && Status != "Cancelled" && Status != "Completed";

        [NotMapped]
        public bool IsPast => AppointmentDate <= DateTime.UtcNow || Status == "Completed";

        [NotMapped]
        public TimeSpan TimeUntilAppointment => AppointmentDate - DateTime.UtcNow;
    }

    public enum AppointmentStatus
    {
        Scheduled,
        Confirmed,
        InProgress,
        Completed,
        Cancelled,
        NoShow
    }

    public enum AppointmentType
    {
        GeneralCheckup,
        Vaccination,
        FollowUp,
        Emergency,
        Consultation,
        Specialist,
        LabTest,
        Imaging,
        Surgery,
        Therapy,
        Other
    }
}