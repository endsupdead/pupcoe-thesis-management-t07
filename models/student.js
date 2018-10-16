const db = require('../db/db.js')

var actions = {
    addProposal: (thesisData,callback) => {
    const query =
    `INSERT INTO 
      thesis (thesis_title,group_id,current_stage,abstract) 
     VALUES 
      ('${thesisData.title}',${thesisData.groupid},'1','${thesisData.abstract}')
      `;
     db.query(query)
    .then(res => callback(res))
    .catch(e => {
      console.log(e)
      callback(e)
    })
  }
}
module.exports = actions