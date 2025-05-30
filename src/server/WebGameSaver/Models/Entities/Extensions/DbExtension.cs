namespace WebGameSaver.Models.Entities.Extensions
{
    public static class DbExtension
    {
        public static IQueryable<Profile> InGame(this IQueryable<Profile> query, string game)
            => query.Where(i => i.Game == game);
    }
}
