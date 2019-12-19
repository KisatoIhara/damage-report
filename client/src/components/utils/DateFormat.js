const DateFormat = (date, format) => {
  format = format.replace(/yyyy/, date.getFullYear());
  format = format.replace(/MM/, ("0" + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/dd/, ("0" + date.getDate()).slice(-2));
  return format;
};

export default DateFormat;
