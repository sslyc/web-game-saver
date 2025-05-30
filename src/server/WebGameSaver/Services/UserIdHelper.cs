using System.Security.Cryptography;
using System.Text;
using WebGameSaver.Models.Entities;

namespace WebGameSaver.Services
{
    public class UserIdHelper
    {
        private WebGameSaverDbContext Db { get; }

        public UserIdHelper(WebGameSaverDbContext db)
        {
            Db = db;
        }

        public string GetUserId(string name, string password)
        {
            var userId = GenUid(name, password);
            var user = Db.Users.FirstOrDefault(i => i.Name == name);
            switch (user)
            {
                case null:
                    Db.Users.Add(new User
                    {
                        Name = name,
                        UserId = userId
                    });
                    Db.SaveChanges();
                    return userId;
                case var u when u.UserId == userId:
                    return userId;
                default:
                    throw new Exception("Password wrong");
            }
        }

        private string GenUid(string name, string password)
        {
            var source = $"{password}7j7gp1ECga2cX6npj2n3VVm25rwwp89j{name}";
            using var sha1 = SHA1.Create();
            var hash = BitConverter.ToString(sha1.ComputeHash(Encoding.UTF8.GetBytes(password))).Replace("-", "");
            return hash;
        }
    }
}
