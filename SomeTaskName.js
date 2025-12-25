module.exports = async () => {
  await fetch('http://3.106.10.199:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'hd.opash@gmail.com',
      uid: 'YhV0mEKGC6QxeN6sMHcODVRSSB62',
    }),
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log(data);
    });
};
