using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FamLink.Api.Data;
using FamLink.Api.Models;

namespace FamLink.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HospitalsController : ControllerBase
    {
        private readonly FamLinkDbContext _context;
        private readonly ILogger<HospitalsController> _logger;

        public HospitalsController(FamLinkDbContext context, ILogger<HospitalsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/hospitals
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetHospitals(
            [FromQuery] string? city = null,
            [FromQuery] string? state = null,
            [FromQuery] string? specialty = null,
            [FromQuery] decimal? latitude = null,
            [FromQuery] decimal? longitude = null,
            [FromQuery] double? radiusKm = 50,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var query = _context.Hospitals.Where(h => h.IsActive);

                // Filter by city
                if (!string.IsNullOrEmpty(city))
                {
                    query = query.Where(h => h.City.ToLower().Contains(city.ToLower()));
                }

                // Filter by state
                if (!string.IsNullOrEmpty(state))
                {
                    query = query.Where(h => h.State.ToLower().Contains(state.ToLower()));
                }

                // Filter by specialty
                if (!string.IsNullOrEmpty(specialty))
                {
                    query = query.Where(h => h.Specialties != null && h.Specialties.Contains(specialty));
                }

                // Get hospitals
                var hospitals = await query
                    .OrderByDescending(h => h.Rating)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(h => new
                    {
                        h.Id,
                        h.Name,
                        h.Address,
                        h.City,
                        h.State,
                        h.ZipCode,
                        h.PhoneNumber,
                        h.Email,
                        h.Website,
                        h.Latitude,
                        h.Longitude,
                        h.SpecialtiesList,
                        h.Rating,
                        h.TotalReviews,
                        h.FullAddress
                    })
                    .ToListAsync();

                // Calculate distance if coordinates provided
                if (latitude.HasValue && longitude.HasValue)
                {
                    foreach (var hospital in hospitals)
                    {
                        if (hospital.Latitude.HasValue && hospital.Longitude.HasValue)
                        {
                            var distance = CalculateDistance(
                                latitude.Value, longitude.Value,
                                hospital.Latitude.Value, hospital.Longitude.Value);
                            
                            // Add distance as a dynamic property
                            var hospitalWithDistance = new
                            {
                                hospital.Id,
                                hospital.Name,
                                hospital.Address,
                                hospital.City,
                                hospital.State,
                                hospital.ZipCode,
                                hospital.PhoneNumber,
                                hospital.Email,
                                hospital.Website,
                                hospital.Latitude,
                                hospital.Longitude,
                                hospital.SpecialtiesList,
                                hospital.Rating,
                                hospital.TotalReviews,
                                hospital.FullAddress,
                                DistanceKm = Math.Round(distance, 2)
                            };
                        }
                    }

                    // Filter by radius if specified
                    if (radiusKm.HasValue)
                    {
                        hospitals = hospitals.Where(h => 
                            h.Latitude.HasValue && h.Longitude.HasValue &&
                            CalculateDistance(latitude.Value, longitude.Value, h.Latitude.Value, h.Longitude.Value) <= radiusKm.Value)
                            .ToList();
                    }
                }

                var totalCount = await query.CountAsync();

                return Ok(new
                {
                    Hospitals = hospitals,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving hospitals");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/hospitals/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetHospital(Guid id)
        {
            try
            {
                var hospital = await _context.Hospitals
                    .FirstOrDefaultAsync(h => h.Id == id && h.IsActive);

                if (hospital == null)
                {
                    return NotFound();
                }

                // Get recent appointments for this hospital (for availability insights)
                var recentAppointments = await _context.Appointments
                    .Where(a => a.HospitalId == id && a.AppointmentDate >= DateTime.UtcNow)
                    .Take(10)
                    .Select(a => new
                    {
                        a.AppointmentDate,
                        a.AppointmentType,
                        a.Status
                    })
                    .ToListAsync();

                var hospitalResponse = new
                {
                    hospital.Id,
                    hospital.Name,
                    hospital.Address,
                    hospital.City,
                    hospital.State,
                    hospital.ZipCode,
                    hospital.PhoneNumber,
                    hospital.Email,
                    hospital.Website,
                    hospital.Latitude,
                    hospital.Longitude,
                    hospital.SpecialtiesList,
                    hospital.Rating,
                    hospital.TotalReviews,
                    hospital.FullAddress,
                    hospital.CreatedAt,
                    hospital.UpdatedAt,
                    UpcomingAppointments = recentAppointments
                };

                return Ok(hospitalResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving hospital {HospitalId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/hospitals/specialties
        [HttpGet("specialties")]
        public ActionResult<IEnumerable<string>> GetSpecialties()
        {
            return Ok(HospitalSpecialties.CommonSpecialties);
        }

        // GET: api/hospitals/search
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<object>>> SearchHospitals([FromQuery] string query)
        {
            try
            {
                if (string.IsNullOrEmpty(query))
                {
                    return BadRequest("Search query is required");
                }

                var hospitals = await _context.Hospitals
                    .Where(h => h.IsActive && 
                        (h.Name.ToLower().Contains(query.ToLower()) ||
                         h.City.ToLower().Contains(query.ToLower()) ||
                         h.State.ToLower().Contains(query.ToLower()) ||
                         (h.Specialties != null && h.Specialties.ToLower().Contains(query.ToLower()))))
                    .OrderByDescending(h => h.Rating)
                    .Take(20)
                    .Select(h => new
                    {
                        h.Id,
                        h.Name,
                        h.Address,
                        h.City,
                        h.State,
                        h.PhoneNumber,
                        h.SpecialtiesList,
                        h.Rating,
                        h.TotalReviews,
                        h.FullAddress
                    })
                    .ToListAsync();

                return Ok(hospitals);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching hospitals with query: {Query}", query);
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/hospitals/{hospitalId}/appointments
        [HttpPost("{hospitalId}/appointments")]
        public async Task<ActionResult<object>> BookAppointment(Guid hospitalId, BookAppointmentRequest request)
        {
            try
            {
                // Verify hospital exists
                var hospital = await _context.Hospitals.FindAsync(hospitalId);
                if (hospital == null || !hospital.IsActive)
                {
                    return NotFound("Hospital not found");
                }

                // Verify user exists
                var user = await _context.Users.FindAsync(request.UserId);
                if (user == null || !user.IsActive)
                {
                    return BadRequest("Invalid user");
                }

                // Verify child exists if provided
                Child? child = null;
                if (request.ChildId.HasValue)
                {
                    child = await _context.Children.FindAsync(request.ChildId.Value);
                    if (child == null || !child.IsActive || child.ParentId != request.UserId)
                    {
                        return BadRequest("Invalid child");
                    }
                }

                // Check for appointment conflicts (same hospital, same time slot)
                var conflictingAppointment = await _context.Appointments
                    .AnyAsync(a => a.HospitalId == hospitalId &&
                                  a.AppointmentDate == request.AppointmentDate &&
                                  a.Status != "Cancelled");

                if (conflictingAppointment)
                {
                    return Conflict("This time slot is already booked");
                }

                var appointment = new Appointment
                {
                    UserId = request.UserId,
                    ChildId = request.ChildId,
                    HospitalId = hospitalId,
                    DoctorName = request.DoctorName,
                    AppointmentDate = request.AppointmentDate,
                    AppointmentType = request.AppointmentType,
                    Notes = request.Notes,
                    Status = "Scheduled"
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                // Load the appointment with related data
                var createdAppointment = await _context.Appointments
                    .Include(a => a.User)
                    .Include(a => a.Child)
                    .Include(a => a.Hospital)
                    .FirstAsync(a => a.Id == appointment.Id);

                return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, new
                {
                    createdAppointment.Id,
                    createdAppointment.AppointmentDate,
                    createdAppointment.AppointmentType,
                    createdAppointment.DoctorName,
                    createdAppointment.Status,
                    createdAppointment.Notes,
                    createdAppointment.CreatedAt,
                    User = new
                    {
                        createdAppointment.User.Id,
                        createdAppointment.User.FirstName,
                        createdAppointment.User.LastName,
                        createdAppointment.User.PhoneNumber
                    },
                    Child = createdAppointment.Child != null ? new
                    {
                        createdAppointment.Child.Id,
                        createdAppointment.Child.FirstName,
                        createdAppointment.Child.LastName,
                        createdAppointment.Child.AgeInYears
                    } : null,
                    Hospital = new
                    {
                        createdAppointment.Hospital.Id,
                        createdAppointment.Hospital.Name,
                        createdAppointment.Hospital.Address,
                        createdAppointment.Hospital.PhoneNumber
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error booking appointment for hospital {HospitalId}", hospitalId);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/hospitals/appointments/{id}
        [HttpGet("appointments/{id}")]
        public async Task<ActionResult<object>> GetAppointment(Guid id)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.User)
                    .Include(a => a.Child)
                    .Include(a => a.Hospital)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null)
                {
                    return NotFound();
                }

                var appointmentResponse = new
                {
                    appointment.Id,
                    appointment.AppointmentDate,
                    appointment.AppointmentType,
                    appointment.DoctorName,
                    appointment.Status,
                    appointment.Notes,
                    appointment.CreatedAt,
                    appointment.UpdatedAt,
                    appointment.IsUpcoming,
                    appointment.IsPast,
                    User = new
                    {
                        appointment.User.Id,
                        appointment.User.FirstName,
                        appointment.User.LastName,
                        appointment.User.PhoneNumber
                    },
                    Child = appointment.Child != null ? new
                    {
                        appointment.Child.Id,
                        appointment.Child.FirstName,
                        appointment.Child.LastName,
                        appointment.Child.AgeInYears
                    } : null,
                    Hospital = new
                    {
                        appointment.Hospital.Id,
                        appointment.Hospital.Name,
                        appointment.Hospital.Address,
                        appointment.Hospital.PhoneNumber,
                        appointment.Hospital.SpecialtiesList
                    }
                };

                return Ok(appointmentResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving appointment {AppointmentId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/hospitals/appointments/{id}/status
        [HttpPut("appointments/{id}/status")]
        public async Task<ActionResult<object>> UpdateAppointmentStatus(Guid id, UpdateAppointmentStatusRequest request)
        {
            try
            {
                var appointment = await _context.Appointments.FindAsync(id);

                if (appointment == null)
                {
                    return NotFound();
                }

                appointment.Status = request.Status;
                if (!string.IsNullOrEmpty(request.Notes))
                {
                    appointment.Notes = request.Notes;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    appointment.Id,
                    appointment.Status,
                    appointment.Notes,
                    appointment.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating appointment status {AppointmentId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // Helper method to calculate distance between two coordinates
        private static double CalculateDistance(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
        {
            const double R = 6371; // Earth's radius in kilometers

            var dLat = ToRadians((double)(lat2 - lat1));
            var dLon = ToRadians((double)(lon2 - lon1));

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians((double)lat1)) * Math.Cos(ToRadians((double)lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

        private static double ToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }
    }

    // DTOs for requests
    public class BookAppointmentRequest
    {
        public Guid UserId { get; set; }
        public Guid? ChildId { get; set; }
        public string? DoctorName { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string AppointmentType { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class UpdateAppointmentStatusRequest
    {
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}