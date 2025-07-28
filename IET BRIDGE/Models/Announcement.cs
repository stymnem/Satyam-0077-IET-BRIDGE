using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace IET_BRIDGE.Models;

[Table("Announcement")]
public partial class Announcement
{
    [Key]
    [Column("AnnouncementID")]
    public int AnnouncementId { get; set; }

    [StringLength(100)]
    public string? Title { get; set; }

    public string? Message { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }
}
