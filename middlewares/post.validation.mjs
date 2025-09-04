export const validateCreatePostData = (req,res,next) => {
    console.log(req.body)

    // 1) ข้อมูล Title,Category 
    if (!req.body.title) {
        return res.status(400).json({
          message: "กรุณาส่งข้อมูล Title ของคำถามเข้ามาด้วย",
        });
      }

      if (!req.body.category) {
        return res.status(400).json({
          message: "กรุณาส่งข้อมูล Category ของคำถามเข้ามาด้วย",
        });
      }

      if (!req.body.email) {
        return res.status(400).json({
          message: "กรุณาส่งข้อมูล Email ของผู้สร้างคำถามเข้ามาด้วย",
        });
      }

       // 2) Email 
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return res.status(400).json({
      message: "กรุณากรอกอีเมลให้ถูกต้อง เช่น user@example.com",
    });
  }

       // 3)คำตอบจะเป็นข้อความไม่เกิน 300 ตัวอักษร
       if (req.body.answer.length > 300) {
        return res.status(400).json({
             message: "คำตอบต้องมีความยาวไม่เกิน 300 ตัวอักษร"
         })
    }
    
    next()
};
