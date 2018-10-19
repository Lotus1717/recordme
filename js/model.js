console.log('model-script')


const createRecord = (data) => {
  let url = 'http://127.0.0.1:8007/recordServer/createRecord'
  axios.post(url, data).then(res => {
    console.log(res)
  })
}

export {
  createRecord
}