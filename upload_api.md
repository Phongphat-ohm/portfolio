# ☁️ API Documentation: Small File Upload

เอกสารนี้อธิบายวิธีการใช้งาน API สำหรับการอัปโหลดไฟล์ขนาดเล็ก (Small File Upload) เข้าสู่ระบบคลาวด์ของเรา

---

## 📌 ข้อมูลพื้นฐาน (Endpoint & Method)

สำหรับการอัปโหลดไฟล์ขนาดเล็ก (แนะนำไม่เกิน 10MB) ให้ส่งไฟล์ไปยัง Endpoint ด้านล่าง:

*   **URL:** `https://cloud.ppkxb.space/api/ext/upload`
*   **Method:** `POST`

---

## 🔑 Request Headers

การส่ง Request จำเป็นต้องแนบ Headers ทั้ง 3 ค่าต่อไปนี้เสมอ:

| Header Name | Required | คำอธิบาย |
| :--- | :---: | :--- |
| `Authorization` | **Yes** | ระบุ API Key ของคุณในรูปแบบ `Bearer pfs_...` |
| `Content-Type` | **Yes** | ต้องเป็น `application/octet-stream` เท่านั้น (เพื่อบอกว่าเป็นการส่ง Raw Binary) |
| `Content-Length` | **Yes** | ขนาดไฟล์จริงเป็นไบต์ (Server ใช้ตรวจสอบความสมบูรณ์ของไฟล์) |

> **หมายเหตุ:** หากใช้งานผ่านเครื่องมืออย่าง cURL, Fetch API (Browser/Node.js) หรือ Postman ระบบมักจะคำนวณและตั้งค่า `Content-Length` ให้โดยอัตโนมัติ

---

## 📝 Query Parameters (ใน URL)

ข้อมูลเมตาของไฟล์ (Metadata) จะถูกส่งผ่าน Query String

| Parameter | Type | Required | คำอธิบาย | ตัวอย่าง |
| :--- | :--- | :---: | :--- | :--- |
| `filename` | string | **Yes** | ชื่อไฟล์และนามสกุล (1-255 ตัวอักษร) <br> *ข้อห้าม: ห้ามมีอักขระ `/`, `\`, null และนามสกุลรันไฟล์ได้ (เช่น .exe, .php)* | `photo.jpg` |
| `mimeType` | string | No | MIME type ของไฟล์ (สูงสุด 255 ตัวอักษร) <br> *หากไม่ส่ง ระบบจะตรวจหาจาก magic bytes ให้อัตโนมัติ* | `image/png` |

> ⚠️ **คำแนะนำ:** หาก `filename` มีอักขระพิเศษ เว้นวรรค หรือภาษาไทย **ต้องทำ URL Encoding** เสมอ (เช่น การใช้ `encodeURIComponent()` ใน JavaScript)

---

## 📦 Request Body

Body ของ Request จะต้องเป็น **ข้อมูลไฟล์ดิบทั้งไฟล์ (Raw Binary)**

*   ❌ ไม่ต้องใช้ `multipart/form-data`
*   ❌ ไม่ต้องห่อด้วย JSON
*   ✅ โยนข้อมูล Binary ของไฟล์เข้าไปตรงๆ

---

## 💻 ตัวอย่างการส่ง Request

### 1. cURL
```bash
curl -X POST "[https://cloud.ppkxb.space/api/ext/upload?filename=photo.jpg&mimeType=image/jpeg](https://cloud.example.com/api/ext/upload?filename=photo.jpg&mimeType=image/jpeg)" \
  -H "Authorization: Bearer pfs_..." \
  -H "Content-Type: application/octet-stream" \
  --data-binary @photo.jpg