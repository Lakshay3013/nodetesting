
// External Imports
const CronJob = require("cron").CronJob;
const config = require('../config/config');
const schedule = require("./scheduler");


module.exports = () => {
 
  const getCheckInCheckOutInMachineData = new CronJob('0 23 * * *', async () => {
    schedule.cronGetCheckInCheckOutInGlueple()
  });

  const getCheckInCheckOutInMachineData1 = new CronJob('0 11 * * *', async () => {
    schedule.cronGetCheckInCheckOutInGlueple()
  });

  const getCheckInCheckOutInMachineData2 = new CronJob('0 13 * * *', async () => {
    schedule.cronGetCheckInCheckOutInGlueple()
  });

  const getCheckInCheckOutInMachineData3 = new CronJob('0 16 * * *', async () => {
    schedule.cronGetCheckInCheckOutInGlueple()
  });

  const calculateAttendance = new CronJob('50 23 * * *', async () => {
    schedule.calculateAttendanceCron()
    

  })

  

  const startCron = () => {
    if (config.env === 'production') {
        getCheckInCheckOutInMachineData.start();
        getCheckInCheckOutInMachineData1.start();
        getCheckInCheckOutInMachineData2.start();
        getCheckInCheckOutInMachineData3.start();
        calculateAttendance.start()
    }
  }
  startCron();
};
