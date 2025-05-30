using Microsoft.AspNetCore.Mvc;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Collections.Generic;
using System.Xml.Linq;
using System;
using WebGameSaver.Models.Entities;
using System.Text.RegularExpressions;
using WebGameSaver.Models.Entities.Extensions;
using WebGameSaver.Services;
using WebGameSaver.Models.Apis;

namespace WebGameSaver.Controllers
{
    [ApiController]
    [Route("")]
    public class ConfigController : ControllerBase
    {

        private readonly ILogger<SaverController> _logger;

        public ConfigController(ILogger<SaverController> logger)
        {
            _logger = logger;
        }

        [HttpPost]
        [Route("config")]
        public object Config([FromBody]ConfigModel config, [FromServices] UserIdHelper userIdHelper)
        {
            try
            {
                var userId = userIdHelper.GetUserId(config.Name, config.Password);
                return new
                {
                    Success = true,
                    UserId = userId
                };
            }
            catch (Exception e)
            {
                return new
                {
                    Success = false,
                    UserId = e.Message
                };
            }
        }
    }
}
