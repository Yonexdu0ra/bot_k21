function queryParams(obj) {
  if(typeof obj !== 'object') {
    return ''
  }
  const keyValuePairs = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      keyValuePairs.push(
        encodeURIComponent(key) + "=" + encodeURIComponent(obj[key])
      );
    }
  }
  return keyValuePairs.join("&");
}
export default queryParams