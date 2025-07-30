using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace IET_BRIDGE.Models;

[Table("Education")]
public partial class Education
{
    [Key]
    [Column("EducationID")]
    public int EducationId { get; set; }

    [Column("AlumniID")]
    public int? AlumniId { get; set; }

    [StringLength(100)]
    public string? Degree { get; set; }

    [StringLength(100)]
    public string? Branch { get; set; }

    public int? GraduationYear { get; set; }

    [ForeignKey("AlumniId")]
    [InverseProperty("Educations")]
    public virtual Alumnus? Alumni { get; set; }
}
