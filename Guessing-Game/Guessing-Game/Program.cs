using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<Guessing_Game.Data.AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("connect")));
builder.Services.AddControllers();
builder.Services.AddCors(p => p.AddPolicy("AllowAll",
    policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));
builder.Services.AddEndpointsApiExplorer();


var app = builder.Build();
app.UseCors("AllowAll");
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseHttpsRedirection();
app.MapControllers();



app.Run();
