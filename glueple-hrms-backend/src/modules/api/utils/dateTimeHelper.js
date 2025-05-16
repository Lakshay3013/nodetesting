const moment = require('moment');

const convertDate = (date) => {
    return new Date(date);
};

const convertDateByMoment = (date, format="YYYY-MM-DD HH:mm:ss") => {
    date = date || moment().format(format);
    return moment(date).format(format);
};

const subtractFromMomentDate = (date, duration, unit, format="YYYY-MM-DD") => {   //subtractDate function
    return moment(date).subtract(duration, unit).format(format);
};

const addInMomentDate = (date, duration, unit, format="YYYY-MM-DD") => {  //additionDate
    return moment(date|| undefined).add(duration, unit).format(format);
};

const getDatesBetweenDateRange = (startDate, endDate) => {
    let date = []
    while (moment(startDate) <= moment(endDate)) {
        date.push({ date: startDate, day: moment(startDate).format("dddd") });
        startDate = moment(startDate).add(1, 'days').format("YYYY-MM-DD");
    }
    return date;
};

const isSunday = function (date) {
    const tempDate = new Date(date);
    return (tempDate.getDay() === 0)
};

const isSaturday = function (date) {
    const tempDate = new Date(date);
    return (tempDate.getDay() === 6)
};

const countOfSaturday = function (date, arr) {
    let tempDate = new Date(date);
    var firstWeekday = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1).getDay();
    var offsetDate = tempDate.getDate() + firstWeekday - 1;
    let countOfSaturday = Math.floor(offsetDate / 7);
    countOfSaturday += 1;
    if (arr.includes(countOfSaturday)) {
        return true
    } else {
        return false
    }
};

const isWeekOffDayData = (weekOffs, date) => {
    let weekNo = moment(date).isoWeekday();
    if (weekOffs.includes(weekNo.toString())) {
        return true
    } else {
        return false
    }
};

const getMomentDuration = (duration) => {
    return moment.duration(duration);
};

const getHours = (time) => {
    time = moment.duration(time);
    return Math.abs(time.asHours());
};

const getMinutes = (time) => {
    time = moment.duration(time);
    return Math.abs(time.asMinutes());
};

const getSeconds = (time) => {
    time = moment.duration(time);
    return Math.abs(time.asSeconds());
};

const getDurationDifference = (time1, time2, format, type) => {
    time1 = moment(time1, format);
    time2 = moment(time2, format);
    if (time1.isAfter(time2) && type == "night") {  //for night shift type night is required to gte proper duration
        time2.add(1, 'day');
    }
    return moment.duration(time1.diff(time2, format));
};

const convertTimeByMoment = (time, format) => {
    return moment(time, format).format(format);
};

const addInMomentTime = (time, duration, unit, format="HH:mm:ss") => {
    return moment(time, format).add(duration, unit).format(format);
};

const subtractFromMomentTime = (time, duration, unit, format="HH:mm:ss") => {
    return moment(time, format).subtract(duration, unit).format(format);
};

const dateIsBetweenDates = (date, comparedDate1, comparedDate2) => {
    return moment(date).isBetween(comparedDate1, comparedDate2);
};

const compareTime = (time1, time2, format = "HH:mm:ss") => {
    time1 = moment(time1, format);
    time2 = moment(time2, format);
    return moment(time1).isBefore(time2);
};

const getStartOrEndDate = (date,format="YYYY-MM-DD")=>{
    const startOfMonth = moment(date).startOf('month').format(format);
    const endOfMonth = moment(date).endOf('month').format(format); 
    return {startOfMonth,endOfMonth}
}

//function to convert 'HH:MM:SS' to duration
const timeStringToDuration = (timeStr) => {
    const [hours, minutes, seconds] = timeStr?.split(':').map(Number);
    return moment.duration({ hours, minutes, seconds });
};

//function to convert duration to 'HH:MM:SS'
const durationToTimeString = (duration) => {
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    return [hours, minutes, seconds].map(num => String(num).padStart(2, '0')).join(':');
};

const calculateWorkingDetails = (data) => {
    let totalWorkingDuration = moment.duration();
    let totalBreakDuration = moment.duration();
    let totalHoursDuration = moment.duration()
    let workingDaysCount = 0;
    let breakDaysCount = 0;

    data.forEach(entry => {
        const workingDuration = timeStringToDuration(entry?.total_working_hours || '00:00:00');
        const breakDuration = timeStringToDuration(entry?.total_break_time || '00:00:00');
        const totalWorking = timeStringToDuration(entry?.duration || '00:00:00')


        if (workingDuration.asSeconds() > 0) {
            totalWorkingDuration.add(workingDuration);
            workingDaysCount++;
        }
        if (breakDuration.asSeconds() > 0) {
            totalBreakDuration.add(breakDuration);
            breakDaysCount++;
        }
        if (totalWorking.asSeconds() > 0) {
            totalHoursDuration.add(totalWorking)
        }
    });

    // Calculate average working and break durations
    const averageWorkingDuration = workingDaysCount > 0
        ? moment.duration(totalWorkingDuration.asSeconds() / workingDaysCount, 'seconds')
        : moment.duration(0);

    const averageBreakDuration = breakDaysCount > 0
        ? moment.duration(totalBreakDuration.asSeconds() / breakDaysCount, 'seconds')
        : moment.duration(0);

    return {
        totalWorkingHours: durationToTimeString(totalWorkingDuration),
        totalBreakHours: durationToTimeString(totalBreakDuration),
        averageWorkingHours: durationToTimeString(averageWorkingDuration),
        averageBreakHours: durationToTimeString(averageBreakDuration),
        totalWorkingDuration: durationToTimeString(totalHoursDuration),
        totalWorkingHoursInSecond:(moment.duration(totalWorkingDuration).asHours()).toFixed(),
        totalBreakHoursInSecond:(moment.duration(totalBreakDuration).asHours()).toFixed(),
        totalWorkingDurationInSecond:(moment.duration(totalHoursDuration).asHours()).toFixed()
    };
};

const currentDate = (format='YYYY-MM-DD')=>{
    return moment().format(format)
}

const convertDateByMoments = (date,fo, format="YYYY-MM-DD HH:mm:ss") => {
    date = date || moment().format(format);
    return moment(date,fo).format(format);
};
const formatExcelDate = (data)=>{
    return moment('1900-01-01')
    .add(data - 2, 'days') 
    .format('YYYY-MM-DD');
}

const timeToSeconds = (time)=> {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

const secondsToTime = (totalSeconds) =>{
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const dateFormat = (data)=>{
    return new Date(data)
}

const isWeekend = function (date) {
    let tempDate = new Date(date);
    return (tempDate.getDay() === 6 || tempDate.getDay() === 0)
  }

const getMonthStartAndEnd = (date) =>{
  const [year, month] = date.split('-').map(Number);
  const startOfMonth = moment({ year, month: month - 1 }).startOf('month');
  const endOfMonth = startOfMonth.clone().endOf('month');
  return {
      startDate: startOfMonth.format('YYYY-MM-DD'),
      endDate: endOfMonth.format('YYYY-MM-DD'),
  };
}

const getNumberOfDaysInMonth = (data)=>{
    const days = moment(data, "YYYY-MM").daysInMonth();
    return days
}

const valueOfData = (data)=>{
    return moment(data).valueOf()
}

const currentDateTOString = ()=>{
    const startOfDay = moment().startOf('day').toISOString(); 
    const endOfDay = moment().endOf('day').toISOString();  
    return { $gte: startOfDay, $lte: endOfDay }
}

const filterMonth = (month)=>{
    const startDate = moment(month, "YYYY-MM").startOf("month").toDate();
    const endDate = moment(month, "YYYY-MM").endOf("month").toDate();
    return {startDate,endDate}
}
const moments = (data)=>{
    return moment(data)
}

function getCurrentWeekRange(day) {
    // const startOfWeek = moment().startOf('isoWeek'); 
    const startOfWeek = moment().subtract(day, 'days')
    const days = [];
  
    for (let i = 0; i < day; i++) {
      const day = startOfWeek.clone().add(i, 'days');
      days.push({
        dayName: day.format('dddd'),    
        date: day.format('YYYY-MM-DD') 
      });
    }
    return days;
  }
  function getCurrentMonthDetails() {
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');    
    
    return {
      startDate: startOfMonth.format('YYYY-MM-DD'),
      endDate: endOfMonth.format('YYYY-MM-DD')
    };
  }
  
  



module.exports = {
    convertDate,
    getDatesBetweenDateRange,
    isSunday,
    isSaturday,
    countOfSaturday,
    isWeekOffDayData,
    convertDateByMoment,
    subtractFromMomentDate,
    addInMomentDate,
    getMomentDuration,
    getHours,
    getMinutes,
    getSeconds,
    getDurationDifference,
    convertTimeByMoment,
    dateIsBetweenDates,
    compareTime,
    addInMomentTime,
    subtractFromMomentTime,
    getStartOrEndDate,
    calculateWorkingDetails,
    currentDate,
    convertDateByMoments,
    formatExcelDate,
    timeToSeconds,
    durationToTimeString,
    secondsToTime,
    dateFormat,
    isWeekend,
    getMonthStartAndEnd,
    getNumberOfDaysInMonth,
    valueOfData,
    currentDateTOString,
    filterMonth,
    moments,
    getCurrentWeekRange,
    getCurrentMonthDetails
};