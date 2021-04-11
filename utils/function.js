const findMonth = (scheduledTime, year, month) => {
  return scheduledTime.find(s => +s.year === +year)
    .userSchedule[month]
}

module.exports = {
  findMonth
}
