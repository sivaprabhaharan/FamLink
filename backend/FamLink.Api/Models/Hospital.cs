using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamLink.Api.Models
{
    public class Hospital
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string State { get; set; } = string.Empty;

        [StringLength(20)]
        public string? ZipCode { get; set; }

        [StringLength(20)]
        public string? PhoneNumber { get; set; }

        [EmailAddress]
        [StringLength(255)]
        public string? Email { get; set; }

        [StringLength(500)]
        public string? Website { get; set; }

        [Column(TypeName = "decimal(10,8)")]
        public decimal? Latitude { get; set; }

        [Column(TypeName = "decimal(11,8)")]
        public decimal? Longitude { get; set; }

        [Column(TypeName = "nvarchar(1000)")]
        public string? Specialties { get; set; } // JSON array of specialties

        [Column(TypeName = "decimal(3,2)")]
        public decimal Rating { get; set; } = 0;

        public int TotalReviews { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

        [NotMapped]
        public List<string> SpecialtiesList
        {
            get
            {
                if (string.IsNullOrEmpty(Specialties))
                    return new List<string>();
                
                try
                {
                    return System.Text.Json.JsonSerializer.Deserialize<List<string>>(Specialties) ?? new List<string>();
                }
                catch
                {
                    return new List<string>();
                }
            }
            set
            {
                Specialties = System.Text.Json.JsonSerializer.Serialize(value);
            }
        }

        [NotMapped]
        public string FullAddress => $"{Address}, {City}, {State} {ZipCode}".Trim();

        [NotMapped]
        public double? DistanceFromUser { get; set; } // Calculated field for distance in km
    }

    public static class HospitalSpecialties
    {
        public static readonly List<string> CommonSpecialties = new()
        {
            "Pediatrics",
            "General Medicine",
            "Emergency Medicine",
            "Cardiology",
            "Neurology",
            "Orthopedics",
            "Dermatology",
            "ENT (Ear, Nose, Throat)",
            "Ophthalmology",
            "Dentistry",
            "Psychiatry",
            "Radiology",
            "Pathology",
            "Anesthesiology",
            "Surgery",
            "Obstetrics & Gynecology",
            "Urology",
            "Gastroenterology",
            "Pulmonology",
            "Endocrinology"
        };
    }
}