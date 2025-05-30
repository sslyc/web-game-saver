using Microsoft.AspNetCore.Mvc;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Collections.Generic;
using System.Xml.Linq;
using System;
using WebGameSaver.Models.Entities;
using System.Text.RegularExpressions;
using WebGameSaver.Models.Entities.Extensions;

namespace WebGameSaver.Controllers
{
    [ApiController]
    [Route("")]
    public class SaverController : ControllerBase
    {

        private readonly ILogger<SaverController> _logger;
        private readonly WebGameSaverDbContext _db;

        public SaverController(ILogger<SaverController> logger, WebGameSaverDbContext db)
        {
            _logger = logger;
            _db = db;
        }

        #region Active

        [HttpGet]
        [Route("{game}/{userId}/list")]
        public IEnumerable<DateTime?> List(string game, string userId)
        {
            var saves = _db.Profiles
                .InGame(game)
                .Where(i => i.UserId == userId && i.MachineName == null)
                .OrderBy(i => i.SavedPosition)
                .ToList();

            foreach (var position in Enumerable.Range(1, 8))
            {
                yield return saves.FirstOrDefault(i => i.SavedPosition == position)?.SavedTime;
            }
        }

        [HttpPost]
        [Route("{game}/{userId}/save/{position}")]
        public bool Save(string game, string userId, int position, [FromBody]string data)
        {
            var save = _db.Profiles.InGame(game)
                .FirstOrDefault(i => i.UserId == userId && i.SavedPosition == position && i.MachineName == null);
            if (save == null)
            {
                save = new Profile
                {
                    Game = game,
                    UserId = userId,
                    SavedPosition = position,
                    SavedTime = DateTime.Now,
                    SavedData = data
                };
                _db.Profiles.Add(save);
            }
            else
            {
                save.SavedTime = DateTime.Now;
                save.SavedData = data;
            }
            return _db.SaveChanges() > 0;
        }

        [HttpGet]
        [Route("{game}/{userId}/load/{position}")]
        [Produces("application/json")]
        public string? Load(string game, string userId, int position)
        {
            var data = _db.Profiles
                .InGame(game)
                .FirstOrDefault(i => i.UserId == userId && i.SavedPosition == position && i.MachineName == null);
            return data?.SavedData;
        }

        #endregion

        #region Passive

        [HttpGet]
        [Route("{game}/{userId}/auto-save/list")]
        public IEnumerable<object> ListMachines(string game, string userId)
        {
            var saves = _db.Profiles
                .InGame(game)
                .Where(i => i.UserId == userId && i.MachineName != null)
                .OrderByDescending(i => i.SavedTime)
                .ToList();

            return saves.Select(i => new { time = i.SavedTime, machine = i.MachineName });
        }




        [HttpGet]
        [Route("{game}/{userId}/auto-save/load/{machine}")]
        [Produces("application/json")]
        public string? LoadMachine(string game, string userId, string machine)
        {
            var data = _db.Profiles
                .InGame(game)
                .FirstOrDefault(i => i.UserId == userId && i.MachineName == machine);
            return data?.SavedData;
        }

        [HttpPost]
        [Route("{game}/{userId}/auto-save/save/{machine}")]
        public bool SaveMachine(string game, string userId, string machine, [FromBody] string data)
        {
            var save = _db.Profiles.InGame(game)
                .FirstOrDefault(i => i.UserId == userId && i.MachineName == machine);
            if (save == null)
            {
                save = new Profile
                {
                    Game = game,
                    UserId = userId,
                    MachineName = machine,
                    SavedTime = DateTime.Now,
                    SavedData = data
                };
                _db.Profiles.Add(save);
            }
            else
            {
                save.SavedTime = DateTime.Now;
                save.SavedData = data;
            }
            return _db.SaveChanges() > 0;
        }
        #endregion
    }
}
