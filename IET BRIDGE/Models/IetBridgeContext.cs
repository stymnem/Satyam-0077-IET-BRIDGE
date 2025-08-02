using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace IET_BRIDGE.Models;

public partial class IetBridgeContext : DbContext
{
    public IetBridgeContext()
    {
    }
    public IetBridgeContext(DbContextOptions<IetBridgeContext> options)
        : base(options)
    {
    }
    public virtual DbSet<Alumnus> Alumni { get; set; }

    public virtual DbSet<Announcement> Announcements { get; set; }

    public virtual DbSet<Education> Educations { get; set; }

    public virtual DbSet<Event> Events { get; set; }

    public virtual DbSet<JobPost> JobPosts { get; set; }

    public virtual DbSet<Professional> Professionals { get; set; }

    public virtual DbSet<Rsvp> Rsvps { get; set; }

  
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Alumnus>(entity =>
        {
            entity.HasKey(e => e.AlumniId).HasName("PK__Alumni__9336240A30668C01");
        });

        modelBuilder.Entity<Announcement>(entity =>
        {
            entity.HasKey(e => e.AnnouncementId).HasName("PK__Announce__9DE4455484C1C61A");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<Education>(entity =>
        {
            entity.HasKey(e => e.EducationId).HasName("PK__Educatio__4BBE38E519CE9DE7");

            entity.HasOne(d => d.Alumni).WithMany(p => p.Educations)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__Education__Alumn__276EDEB3");
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.EventId).HasName("PK__Event__7944C87087E65BA8");
        });

        modelBuilder.Entity<JobPost>(entity =>
        {
            entity.HasKey(e => e.JobId).HasName("PK__JobPost__056690E2F81529C3");

            entity.Property(e => e.PostedOn).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Alumni).WithMany(p => p.JobPosts)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__JobPost__AlumniI__2B3F6F97");
        });

        modelBuilder.Entity<Professional>(entity =>
        {
            entity.HasKey(e => e.ProfessionalId).HasName("PK__Professi__B242EF489A39BFC4");

            entity.HasOne(d => d.Alumni).WithMany(p => p.Professionals)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__Professio__Alumn__36B12243");
        });

        modelBuilder.Entity<Rsvp>(entity =>
        {
            entity.HasKey(e => e.Rsvpid).HasName("PK__RSVP__BD17F2B67F42F2CC");

            entity.HasOne(d => d.Alumni).WithMany(p => p.Rsvps)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__RSVP__AlumniID__30F848ED");

            entity.HasOne(d => d.Event).WithMany(p => p.Rsvps)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__RSVP__EventID__300424B4");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
