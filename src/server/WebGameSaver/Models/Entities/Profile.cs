using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Contracts;

namespace WebGameSaver.Models.Entities
{
    public class Profile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [MaxLength(50)]
        [Required]
        public string Game { get; set; }

        [MaxLength(50)]
        [Required]
        public string UserId { get; set; }

        [Required]
        public string SavedData { get; set; }

        public int SavedPosition { get; set; }

        public DateTime SavedTime { get; set; }

        [MaxLength(50)]
        public string? MachineName { get; set; }

    }
}
