module.exports = {
  apps: [
    {
      name: 'ScheduleAOKBApp',
      port: '3002',
      exec_mode: 'cluster',
      instances: 'max',
      script: './node_modules/nuxt/bin/nuxt.js',
      args: 'start'
    }
  ]
}
