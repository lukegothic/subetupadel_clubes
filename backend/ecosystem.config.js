module.exports = {
  apps: [
    {
      name: "padel-app-backend",
      script: "src/server.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000
      },
      env_demo: {
        NODE_ENV: "demo",
        PORT: 3000
      },
      max_memory_restart: "300M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      error_file: "logs/error.log",
      out_file: "logs/out.log"
    }
  ]
}
