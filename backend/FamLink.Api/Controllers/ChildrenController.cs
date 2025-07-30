using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FamLink.Api.Data;
using FamLink.Api.Models;

namespace FamLink.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChildrenController : ControllerBase
    {
        private readonly FamLinkDbContext _context;
        private readonly ILogger<ChildrenController> _logger;

        public ChildrenController(FamLinkDbContext context, ILogger<ChildrenController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/children/parent/{parentId}
        [HttpGet("parent/{parentId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetChildrenByParent(Guid parentId)
        {
            try
            {
                var parent = await _context.Users.FindAsync(parentId);
                if (parent == null || !parent.IsActive)
                {
                    return NotFound("Parent not found");
                }

                var children = await _context.Children
                    .Where(c => c.ParentId == parentId && c.IsActive)
                    .OrderBy(c => c.DateOfBirth)
                    .Select(c => new
                    {
                        c.Id,
                        c.FirstName,
                        c.LastName,
                        c.DateOfBirth,
                        c.Gender,
                        c.BloodType,
                        c.Allergies,
                        c.MedicalConditions,
                        c.EmergencyContact,
                        c.EmergencyPhone,
                        c.ProfilePictureUrl,
                        c.AgeInYears,
                        c.AgeInMonths,
                        c.FullName,
                        c.CreatedAt,
                        c.UpdatedAt,
                        MedicalRecordsCount = c.MedicalRecords.Count(mr => mr.IsActive),
                        AppointmentsCount = c.Appointments.Count(a => a.Status != "Cancelled")
                    })
                    .ToListAsync();

                return Ok(children);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving children for parent {ParentId}", parentId);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/children/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetChild(Guid id)
        {
            try
            {
                var child = await _context.Children
                    .Include(c => c.Parent)
                    .Include(c => c.MedicalRecords.Where(mr => mr.IsActive))
                    .Include(c => c.Appointments.Where(a => a.Status != "Cancelled"))
                        .ThenInclude(a => a.Hospital)
                    .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

                if (child == null)
                {
                    return NotFound();
                }

                var childResponse = new
                {
                    child.Id,
                    child.FirstName,
                    child.LastName,
                    child.DateOfBirth,
                    child.Gender,
                    child.BloodType,
                    child.Allergies,
                    child.MedicalConditions,
                    child.EmergencyContact,
                    child.EmergencyPhone,
                    child.ProfilePictureUrl,
                    child.AgeInYears,
                    child.AgeInMonths,
                    child.FullName,
                    child.CreatedAt,
                    child.UpdatedAt,
                    Parent = new
                    {
                        child.Parent.Id,
                        child.Parent.FirstName,
                        child.Parent.LastName,
                        child.Parent.Email,
                        child.Parent.PhoneNumber
                    },
                    RecentMedicalRecords = child.MedicalRecords
                        .OrderByDescending(mr => mr.RecordDate)
                        .Take(5)
                        .Select(mr => new
                        {
                            mr.Id,
                            mr.RecordType,
                            mr.Title,
                            mr.RecordDate,
                            mr.DoctorName,
                            mr.HospitalName
                        }),
                    UpcomingAppointments = child.Appointments
                        .Where(a => a.AppointmentDate > DateTime.UtcNow)
                        .OrderBy(a => a.AppointmentDate)
                        .Take(3)
                        .Select(a => new
                        {
                            a.Id,
                            a.AppointmentDate,
                            a.AppointmentType,
                            a.DoctorName,
                            a.Status,
                            Hospital = new
                            {
                                a.Hospital.Id,
                                a.Hospital.Name,
                                a.Hospital.Address
                            }
                        })
                };

                return Ok(childResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving child {ChildId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/children
        [HttpPost]
        public async Task<ActionResult<object>> CreateChild(CreateChildRequest request)
        {
            try
            {
                // Verify parent exists
                var parent = await _context.Users.FindAsync(request.ParentId);
                if (parent == null || !parent.IsActive)
                {
                    return BadRequest("Invalid parent");
                }

                var child = new Child
                {
                    ParentId = request.ParentId,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    DateOfBirth = request.DateOfBirth,
                    Gender = request.Gender,
                    BloodType = request.BloodType,
                    Allergies = request.Allergies,
                    MedicalConditions = request.MedicalConditions,
                    EmergencyContact = request.EmergencyContact,
                    EmergencyPhone = request.EmergencyPhone,
                    ProfilePictureUrl = request.ProfilePictureUrl
                };

                _context.Children.Add(child);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetChild), new { id = child.Id }, new
                {
                    child.Id,
                    child.FirstName,
                    child.LastName,
                    child.DateOfBirth,
                    child.Gender,
                    child.BloodType,
                    child.Allergies,
                    child.MedicalConditions,
                    child.EmergencyContact,
                    child.EmergencyPhone,
                    child.ProfilePictureUrl,
                    child.AgeInYears,
                    child.AgeInMonths,
                    child.FullName,
                    child.CreatedAt,
                    child.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating child");
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/children/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<object>> UpdateChild(Guid id, UpdateChildRequest request)
        {
            try
            {
                var child = await _context.Children.FindAsync(id);

                if (child == null || !child.IsActive)
                {
                    return NotFound();
                }

                // Update child properties
                child.FirstName = request.FirstName ?? child.FirstName;
                child.LastName = request.LastName ?? child.LastName;
                child.DateOfBirth = request.DateOfBirth ?? child.DateOfBirth;
                child.Gender = request.Gender ?? child.Gender;
                child.BloodType = request.BloodType ?? child.BloodType;
                child.Allergies = request.Allergies ?? child.Allergies;
                child.MedicalConditions = request.MedicalConditions ?? child.MedicalConditions;
                child.EmergencyContact = request.EmergencyContact ?? child.EmergencyContact;
                child.EmergencyPhone = request.EmergencyPhone ?? child.EmergencyPhone;
                child.ProfilePictureUrl = request.ProfilePictureUrl ?? child.ProfilePictureUrl;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    child.Id,
                    child.FirstName,
                    child.LastName,
                    child.DateOfBirth,
                    child.Gender,
                    child.BloodType,
                    child.Allergies,
                    child.MedicalConditions,
                    child.EmergencyContact,
                    child.EmergencyPhone,
                    child.ProfilePictureUrl,
                    child.AgeInYears,
                    child.AgeInMonths,
                    child.FullName,
                    child.CreatedAt,
                    child.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating child {ChildId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // DELETE: api/children/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChild(Guid id)
        {
            try
            {
                var child = await _context.Children.FindAsync(id);

                if (child == null)
                {
                    return NotFound();
                }

                // Soft delete
                child.IsActive = false;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting child {ChildId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/children/{id}/dashboard
        [HttpGet("{id}/dashboard")]
        public async Task<ActionResult<object>> GetChildDashboard(Guid id)
        {
            try
            {
                var child = await _context.Children
                    .Include(c => c.MedicalRecords.Where(mr => mr.IsActive))
                    .Include(c => c.Appointments)
                        .ThenInclude(a => a.Hospital)
                    .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

                if (child == null)
                {
                    return NotFound();
                }

                var dashboard = new
                {
                    Child = new
                    {
                        child.Id,
                        child.FirstName,
                        child.LastName,
                        child.AgeInYears,
                        child.AgeInMonths,
                        child.Gender,
                        child.ProfilePictureUrl
                    },
                    HealthSummary = new
                    {
                        TotalMedicalRecords = child.MedicalRecords.Count,
                        LastCheckup = child.MedicalRecords
                            .Where(mr => mr.RecordType == "Checkup")
                            .OrderByDescending(mr => mr.RecordDate)
                            .Select(mr => new { mr.RecordDate, mr.DoctorName })
                            .FirstOrDefault(),
                        LastVaccination = child.MedicalRecords
                            .Where(mr => mr.RecordType == "Vaccination")
                            .OrderByDescending(mr => mr.RecordDate)
                            .Select(mr => new { mr.Title, mr.RecordDate })
                            .FirstOrDefault(),
                        ActiveAllergies = !string.IsNullOrEmpty(child.Allergies) ? child.Allergies.Split(',').Select(a => a.Trim()).ToList() : new List<string>(),
                        MedicalConditions = !string.IsNullOrEmpty(child.MedicalConditions) ? child.MedicalConditions.Split(',').Select(c => c.Trim()).ToList() : new List<string>()
                    },
                    UpcomingAppointments = child.Appointments
                        .Where(a => a.AppointmentDate > DateTime.UtcNow && a.Status != "Cancelled")
                        .OrderBy(a => a.AppointmentDate)
                        .Take(3)
                        .Select(a => new
                        {
                            a.Id,
                            a.AppointmentDate,
                            a.AppointmentType,
                            a.DoctorName,
                            a.Status,
                            Hospital = new
                            {
                                a.Hospital.Name,
                                a.Hospital.Address,
                                a.Hospital.PhoneNumber
                            }
                        }),
                    RecentActivity = child.MedicalRecords
                        .OrderByDescending(mr => mr.CreatedAt)
                        .Take(5)
                        .Select(mr => new
                        {
                            Type = "Medical Record",
                            mr.Title,
                            mr.RecordType,
                            Date = mr.RecordDate,
                            mr.CreatedAt
                        })
                        .Union(
                            child.Appointments
                                .Where(a => a.CreatedAt >= DateTime.UtcNow.AddDays(-30))
                                .OrderByDescending(a => a.CreatedAt)
                                .Take(5)
                                .Select(a => new
                                {
                                    Type = "Appointment",
                                    Title = $"{a.AppointmentType} - {a.Hospital.Name}",
                                    RecordType = a.AppointmentType,
                                    Date = a.AppointmentDate,
                                    a.CreatedAt
                                })
                        )
                        .OrderByDescending(x => x.CreatedAt)
                        .Take(10),
                    GrowthMilestones = GenerateGrowthMilestones(child.AgeInMonths),
                    HealthTips = GenerateAgeSpecificTips(child.AgeInMonths)
                };

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard for child {ChildId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // Private helper methods
        private List<object> GenerateGrowthMilestones(int ageInMonths)
        {
            var milestones = new List<object>();

            if (ageInMonths <= 12)
            {
                milestones.AddRange(new[]
                {
                    new { Milestone = "Sits without support", ExpectedAge = "6-8 months", Status = ageInMonths >= 6 ? "Expected" : "Upcoming" },
                    new { Milestone = "Says first words", ExpectedAge = "10-14 months", Status = ageInMonths >= 10 ? "Expected" : "Upcoming" },
                    new { Milestone = "Walks independently", ExpectedAge = "12-15 months", Status = ageInMonths >= 12 ? "Expected" : "Upcoming" }
                });
            }
            else if (ageInMonths <= 24)
            {
                milestones.AddRange(new[]
                {
                    new { Milestone = "Uses 2-word phrases", ExpectedAge = "18-24 months", Status = ageInMonths >= 18 ? "Expected" : "Upcoming" },
                    new { Milestone = "Runs steadily", ExpectedAge = "18-24 months", Status = ageInMonths >= 18 ? "Expected" : "Upcoming" },
                    new { Milestone = "Shows interest in potty training", ExpectedAge = "20-30 months", Status = ageInMonths >= 20 ? "Expected" : "Upcoming" }
                });
            }
            else
            {
                milestones.AddRange(new[]
                {
                    new { Milestone = "Speaks in sentences", ExpectedAge = "2-3 years", Status = ageInMonths >= 24 ? "Expected" : "Upcoming" },
                    new { Milestone = "Plays with other children", ExpectedAge = "2-4 years", Status = ageInMonths >= 24 ? "Expected" : "Upcoming" },
                    new { Milestone = "Shows independence", ExpectedAge = "2-4 years", Status = ageInMonths >= 24 ? "Expected" : "Upcoming" }
                });
            }

            return milestones;
        }

        private List<object> GenerateAgeSpecificTips(int ageInMonths)
        {
            var tips = new List<object>();

            if (ageInMonths <= 12)
            {
                tips.AddRange(new[]
                {
                    new { Category = "Nutrition", Tip = "Continue breastfeeding or formula feeding", Priority = "High" },
                    new { Category = "Safety", Tip = "Baby-proof your home as mobility increases", Priority = "High" },
                    new { Category = "Development", Tip = "Provide tummy time for muscle development", Priority = "Medium" }
                });
            }
            else if (ageInMonths <= 24)
            {
                tips.AddRange(new[]
                {
                    new { Category = "Nutrition", Tip = "Introduce variety of solid foods", Priority = "High" },
                    new { Category = "Development", Tip = "Read books together daily", Priority = "High" },
                    new { Category = "Safety", Tip = "Secure furniture and use safety gates", Priority = "High" }
                });
            }
            else
            {
                tips.AddRange(new[]
                {
                    new { Category = "Nutrition", Tip = "Establish healthy eating routines", Priority = "High" },
                    new { Category = "Development", Tip = "Encourage social play with peers", Priority = "Medium" },
                    new { Category = "Education", Tip = "Consider preschool readiness activities", Priority = "Medium" }
                });
            }

            return tips;
        }
    }

    // DTOs for requests
    public class CreateChildRequest
    {
        public Guid ParentId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string? BloodType { get; set; }
        public string? Allergies { get; set; }
        public string? MedicalConditions { get; set; }
        public string? EmergencyContact { get; set; }
        public string? EmergencyPhone { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }

    public class UpdateChildRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? BloodType { get; set; }
        public string? Allergies { get; set; }
        public string? MedicalConditions { get; set; }
        public string? EmergencyContact { get; set; }
        public string? EmergencyPhone { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }
}