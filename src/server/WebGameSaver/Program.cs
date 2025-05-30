using Microsoft.EntityFrameworkCore;
using System;
using WebGameSaver.Models.Entities;
using WebGameSaver.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<WebGameSaverDbContext>(action =>
{
    action.UseSqlite("Data Source=./db/webgamesaver.db");
});

builder.Services.AddScoped<UserIdHelper>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyHeader()
            .AllowAnyOrigin()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseAuthorization();

app.UseCors();

app.MapControllers();

app.Run();
