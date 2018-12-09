const getFieldsFromForm = (form) => {
  const test = Array.prototype.slice.call(form);
  let result = {};
  test.forEach(elem =>{
    Object.assign(result, {[elem.name]: elem.value});
  });

  return result;
}
