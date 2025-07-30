using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace IET_BRIDGE.Models;

[Table("Professional")]
public partial class Professional
{
    [Key]
    [Column("ProfessionalID")]
    public int ProfessionalId { get; set; }

    [Column("AlumniID")]
    public int? AlumniId { get; set; }

    [StringLength(100)]
    public string? Company { get; set; }

    [StringLength(100)]
    public string? Designation { get; set; }

    [StringLength(100)]
    public string? Industry { get; set; }

    [ForeignKey("AlumniId")]
    [InverseProperty("Professionals")]
    public virtual Alumnus? Alumni { get; set; }
}
