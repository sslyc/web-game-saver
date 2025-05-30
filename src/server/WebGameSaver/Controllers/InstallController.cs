using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using WebGameSaver.Models.Entities;

namespace WebGameSaver.Controllers
{
    [Route("install")]
    [ApiController]
    public class InstallController : ControllerBase
    {

        [Route("")]
        [HttpGet]
        public string Install([FromServices]WebGameSaverDbContext db)
        {
            try
            {
                var rsl = db.Database.EnsureCreated();
                return rsl ? "installed" : "already exists";
            }
            catch 
            {
                return "failed";
            }
        }
    }
}
