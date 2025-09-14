using InvascanDataSync.Data;
using InvascanDataSync.Data.Repositories;
using InvascanDataSync.Domain.Models;
using InvascanDataSync.Domain.Services.INaturalist;
using InvascanDataSync.Domain.Services.Invascan;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Topshelf;
using Host = Microsoft.Extensions.Hosting.Host;




void LoadConfiguration(HostBuilderContext host, IConfigurationBuilder builder)
{
    builder
        .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
        .AddJsonFile("invascan.json", optional: false, reloadOnChange: true)
        .AddEnvironmentVariables();

    Log.Logger = new LoggerConfiguration()
        .ReadFrom.Configuration(builder.Build())
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .CreateLogger();
}



void ConfigureServices(HostBuilderContext host, IServiceCollection services)
{
    services

    #region -- custom configurations --
    .Configure<InaturalistConfig>(host.Configuration.GetSection("Inaturalist"))
    //.Configure<PWUDConfiguration>(host.Configuration.GetSection("PWUD"))
    //.Configure<SWConfiguration>(host.Configuration.GetSection("SEXWORK"))
    //.Configure<MSMConfiguration>(host.Configuration.GetSection("MSM"))
    //.Configure<DefaultSchedules>(host.Configuration.GetSection("defaultSchedules"))
    #endregion

    #region -- db context --
    .AddSingleton<InvascanDbContext>()
    #endregion

    #region -- repositories --
    .AddSingleton<InvascanRepository>()
    //.AddSingleton<IWorkflowRepository, WorkflowRepository>()
    //.AddSingleton<IBiometricRepository, BiometricRepository>()
    #endregion

    #region -- services --
    .AddSingleton<InaturalistService>()
    .AddSingleton<DataService>()
    //.AddSingleton<IPWUDCandidateService, PWUDCandidateService>()
    //.AddSingleton<IPWUDUserService, PWUDUserService>()
    //.AddSingleton<ISWCandidateService, SWCandidateService>()
    //.AddSingleton<ISWUserService, SWUserService>()
    //.AddSingleton<IMSMUserService, MSMUserService>()
    //.AddSingleton<IMSMCandidateService, MSMCandidateService>()
    #endregion

    .AddLogging((loggingBuilder) =>
    {
        loggingBuilder
        .SetMinimumLevel(LogLevel.Trace)
        .AddConsole()
        .AddConfiguration(host.Configuration);
    });
}


IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .ConfigureAppConfiguration(LoadConfiguration)
        .ConfigureServices(ConfigureServices);

var host = CreateHostBuilder(args).UseSerilog().Build();

var service = host.Services.GetService<DataService>();
await service.InitiateDataSync();




#region --setting up the app to run as a windows service using topshelf library--

//var exitCode = HostFactory.Run(x =>
//{
//    //x.Service<MigrationEngine>(s =>
//    //{
//    //    s.ConstructUsing(engine => new MigrationEngine
//    //    (
//    //        host.Services.GetRequiredService<IConfiguration>(),
//    //        host.Services.GetRequiredService<ILogger<MigrationEngine>>(),
//    //        host.Services.GetRequiredService<IPWUDCandidateService>(),
//    //        host.Services.GetRequiredService<IPWUDUserService>(),
//    //        host.Services.GetRequiredService<ISWCandidateService>(),
//    //        host.Services.GetRequiredService<ISWUserService>(),
//    //        host.Services.GetRequiredService<IMSMUserService>(),
//    //        host.Services.GetRequiredService<IMSMCandidateService>(),
//    //        host.Services.GetRequiredService<IOptions<DefaultSchedules>>()
//    //    ));
//    //    s.WhenStarted(engine => engine.Start());
//    //    s.WhenPaused(engine => engine.Pause());
//    //    s.WhenContinued(engine => engine.Restart());
//    //    s.WhenStopped(engine => engine.Stop());
//    //});

//    x.EnableServiceRecovery(y =>
//    {
//        y.RestartService(5);
//    });

//    //x.EnableShutdown();

//    x.OnException(ex =>
//    {
//        //writes to a file
//        Log.Error(ex, "");
//    });


//    //Setting up the default account to run the service
//    x.RunAsLocalSystem();
//    x.EnableShutdown();
//    x.StartAutomaticallyDelayed();

//    //Setting up the service identity information
//    x.SetServiceName("InvascanDataSync");

//    //x.SetDisplayName("Workflow Reporting Service Core v2");
//    x.SetDisplayName("Invascan Data Sync Service");
//    x.SetDescription("");
//});

//var exitCodeValue = (int)Convert.ChangeType(exitCode, exitCode.GetTypeCode());
//Environment.ExitCode = exitCodeValue;

#endregion