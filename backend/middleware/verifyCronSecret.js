function verifyCronSecret(req, res, next) {
     console.log('Expected:', JSON.stringify(process.env.CRON_SECRET));
     console.log('Received:', JSON.stringify(req.headers['x-cron-secret']));

     const providedSecret = req.headers['x-cron-secret'];

     if (!providedSecret || providedSecret !== process.env.CRON_SECRET) {
       return res.status(403).json({ message: 'Forbidden' });
     }

     next();
   }

   module.exports = verifyCronSecret;