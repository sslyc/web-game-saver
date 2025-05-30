FROM mcr.microsoft.com/dotnet/aspnet:8.0-bookworm-slim
# RUN rm -f /etc/localtime && ln -sv /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo \"Asia/Shanghai\" > /etc/timezone
EXPOSE 80
WORKDIR /app
COPY bin/Release/net8.0/publish .
ENTRYPOINT [ "dotnet", "WebGameSaver.dll", "urls=http://0.0.0.0:80" ]