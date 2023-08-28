async function checkIfUserExists(userId) {
    const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)';
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows[0].exists;
  }
  
  async function createUser(userId, chatId, fullName, companyName, phoneNumber) {
    const query = 'INSERT INTO users (id, chat_id, company_name, phone_number, full_name) VALUES ($1, $2, $3, $4, $5)';
    const values = [userId, chatId, companyName, phoneNumber, fullName];
    await pool.query(query, values);
  }
  
  async function createMerchant(chatId, merchantName) {
    const query = 'UPDATE users SET merchants = array_append(merchants, $1) WHERE chat_id = $2';
    const values = [merchantName, chatId];
    await pool.query(query, values);
  }
  
  async function deleteMerchant(chatId, merchantName) {
    const query = 'UPDATE users SET merchants = array_remove(merchants, $1::text) WHERE chat_id = $2';
    const values = [merchantName, chatId];
    await pool.query(query, values);
  }
  
  async function getMerchants(chatId) {
    const query = 'SELECT merchants FROM users WHERE chat_id = $1';
    const values = [chatId];
    const result = await pool.query(query, values);
  
    if (result.rows.length > 0) {
      try {
        const merchantsArray = result.rows[0].merchants || [];
        console.log('Merchants:', merchantsArray); 
        const merchantNames = merchantsArray.join('\n');
        console.log('Merchant Names:', merchantNames); 
  
        return merchantsArray;
      } catch (error) {
        console.error('Error parsing merchants:', error);
        return [];
      }
    } else {
      return [];
    }
  }





  module.exports = {
    checkIfUserExists,
    createUser,
    createMerchant,
    deleteMerchant,
    getMerchants,
  };