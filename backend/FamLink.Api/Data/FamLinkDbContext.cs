using Microsoft.EntityFrameworkCore;
using FamLink.Api.Models;

namespace FamLink.Api.Data
{
    public class FamLinkDbContext : DbContext
    {
        public FamLinkDbContext(DbContextOptions<FamLinkDbContext> options) : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<User> Users { get; set; }
        public DbSet<Child> Children { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<Hospital> Hospitals { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<CommunityPost> CommunityPosts { get; set; }
        public DbSet<CommunityComment> CommunityComments { get; set; }
        public DbSet<CommunityLike> CommunityLikes { get; set; }
        public DbSet<ChatbotConversation> ChatbotConversations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.CognitoUserId).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure Child entity
            modelBuilder.Entity<Child>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ParentId);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                
                entity.HasOne(e => e.Parent)
                    .WithMany(e => e.Children)
                    .HasForeignKey(e => e.ParentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure MedicalRecord entity
            modelBuilder.Entity<MedicalRecord>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ChildId);
                entity.HasIndex(e => e.RecordDate);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                
                entity.HasOne(e => e.Child)
                    .WithMany(e => e.MedicalRecords)
                    .HasForeignKey(e => e.ChildId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Hospital entity
            modelBuilder.Entity<Hospital>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.City, e.State });
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.Rating).HasPrecision(3, 2);
                entity.Property(e => e.Latitude).HasPrecision(10, 8);
                entity.Property(e => e.Longitude).HasPrecision(11, 8);
            });

            // Configure Appointment entity
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.AppointmentDate);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                
                entity.HasOne(e => e.User)
                    .WithMany(e => e.Appointments)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.Child)
                    .WithMany(e => e.Appointments)
                    .HasForeignKey(e => e.ChildId)
                    .OnDelete(DeleteBehavior.SetNull);
                
                entity.HasOne(e => e.Hospital)
                    .WithMany(e => e.Appointments)
                    .HasForeignKey(e => e.HospitalId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure CommunityPost entity
            modelBuilder.Entity<CommunityPost>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.Category);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                
                entity.HasOne(e => e.User)
                    .WithMany(e => e.CommunityPosts)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure CommunityComment entity
            modelBuilder.Entity<CommunityComment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.PostId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ParentCommentId);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                
                entity.HasOne(e => e.Post)
                    .WithMany(e => e.Comments)
                    .HasForeignKey(e => e.PostId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.User)
                    .WithMany(e => e.CommunityComments)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.NoAction);
                
                entity.HasOne(e => e.ParentComment)
                    .WithMany(e => e.Replies)
                    .HasForeignKey(e => e.ParentCommentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure CommunityLike entity
            modelBuilder.Entity<CommunityLike>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.PostId);
                entity.HasIndex(e => e.CommentId);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                
                // Ensure a user can only like a post or comment once
                entity.HasIndex(e => new { e.UserId, e.PostId }).IsUnique().HasFilter("[PostId] IS NOT NULL");
                entity.HasIndex(e => new { e.UserId, e.CommentId }).IsUnique().HasFilter("[CommentId] IS NOT NULL");
                
                entity.HasOne(e => e.User)
                    .WithMany(e => e.CommunityLikes)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.Post)
                    .WithMany(e => e.Likes)
                    .HasForeignKey(e => e.PostId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.Comment)
                    .WithMany(e => e.Likes)
                    .HasForeignKey(e => e.CommentId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // Check constraint to ensure either PostId or CommentId is set, but not both
                entity.HasCheckConstraint("CK_CommunityLike_Target", 
                    "([PostId] IS NOT NULL AND [CommentId] IS NULL) OR ([PostId] IS NULL AND [CommentId] IS NOT NULL)");
            });

            // Configure ChatbotConversation entity
            modelBuilder.Entity<ChatbotConversation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.SessionId);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                
                entity.HasOne(e => e.User)
                    .WithMany(e => e.ChatbotConversations)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.Child)
                    .WithMany(e => e.ChatbotConversations)
                    .HasForeignKey(e => e.ChildId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Seed data for hospitals
            SeedHospitalData(modelBuilder);
        }

        private void SeedHospitalData(ModelBuilder modelBuilder)
        {
            var hospitals = new[]
            {
                new Hospital
                {
                    Id = Guid.NewGuid(),
                    Name = "Apollo Children Hospital",
                    Address = "123 Health Street, Bandra",
                    City = "Mumbai",
                    State = "Maharashtra",
                    ZipCode = "400001",
                    PhoneNumber = "+91-22-12345678",
                    Email = "info@apollochildren.com",
                    Website = "https://apollochildren.com",
                    Latitude = 19.0760m,
                    Longitude = 72.8777m,
                    Specialties = "[\"Pediatrics\", \"Cardiology\", \"Neurology\"]",
                    Rating = 4.5m,
                    TotalReviews = 150,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Hospital
                {
                    Id = Guid.NewGuid(),
                    Name = "Rainbow Children Hospital",
                    Address = "456 Care Avenue, Koramangala",
                    City = "Bangalore",
                    State = "Karnataka",
                    ZipCode = "560001",
                    PhoneNumber = "+91-80-87654321",
                    Email = "contact@rainbowchildren.com",
                    Website = "https://rainbowchildren.com",
                    Latitude = 12.9716m,
                    Longitude = 77.5946m,
                    Specialties = "[\"Pediatrics\", \"Orthopedics\", \"Emergency\"]",
                    Rating = 4.3m,
                    TotalReviews = 200,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Hospital
                {
                    Id = Guid.NewGuid(),
                    Name = "Fortis Kids Clinic",
                    Address = "789 Wellness Road, Connaught Place",
                    City = "Delhi",
                    State = "Delhi",
                    ZipCode = "110001",
                    PhoneNumber = "+91-11-11223344",
                    Email = "info@fortiskids.com",
                    Website = "https://fortiskids.com",
                    Latitude = 28.7041m,
                    Longitude = 77.1025m,
                    Specialties = "[\"Pediatrics\", \"Dermatology\", \"ENT\"]",
                    Rating = 4.2m,
                    TotalReviews = 120,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            modelBuilder.Entity<Hospital>().HasData(hospitals);
        }

        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateTimestamps()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is User || e.Entity is Child || e.Entity is MedicalRecord || 
                           e.Entity is Hospital || e.Entity is Appointment || e.Entity is CommunityPost || 
                           e.Entity is CommunityComment || e.Entity is ChatbotConversation)
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
                }
                
                if (entry.State == EntityState.Modified)
                {
                    entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
                }
            }
        }
    }
}