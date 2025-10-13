import datetime
import os

import certifi
import jwt
from bson import ObjectId
from flask import Flask, request, jsonify, send_from_directory
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.utils import secure_filename

# -------------------------------
# FLASK APP SETUP
# -------------------------------
app = Flask(__name__)
app.config["SECRET_KEY"] = "myverysecuresecretkey"
app.config["UPLOAD_FOLDER"] = "uploads/videos"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

bcrypt = Bcrypt(app)

# ✅ Proper CORS setup
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# -------------------------------
# MONGODB CONNECTION
# -------------------------------
MONGO_URI = "mongodb+srv://somu:Somu8499@cluster0.61aqpsp.mongodb.net/"
client = MongoClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())

db = client["myAppDB"]
deaf_users = db["deaf_users"]
admin_users = db["admin_users"]
videos = db["videos"]

# -------------------------------
# GLOBAL OPTIONS HANDLER
# -------------------------------
@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        return '', 200  # ✅ Respond to preflight requests globally

# -------------------------------
# DEAF USER SIGNUP
# -------------------------------
@app.route("/deaf/signup", methods=["POST"])
def deaf_signup():
    data = request.json
    if deaf_users.find_one({"email": data["email"]}):
        return jsonify({"message": "User already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    new_user = {
        "fullName": data.get("fullName"),
        "username": data.get("username"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "gender": data.get("gender"),
        "dateOfBirth": data.get("dateOfBirth"),
        "preferredSignLanguage": data.get("preferredSignLanguage"),
        "communicationPreference": data.get("communicationPreference"),
        "emergencyContactName": data.get("emergencyContactName"),
        "emergencyContactNumber": data.get("emergencyContactNumber"),
        "medicalNotes": data.get("medicalNotes"),
        "password": hashed_pw,
        "role": "deaf",
        "createdAt": datetime.datetime.utcnow()
    }

    deaf_users.insert_one(new_user)
    return jsonify({"message": "Deaf user signup successful"}), 201

# -------------------------------
# ADMIN SIGNUP
# -------------------------------
@app.route("/admin/signup", methods=["POST"])
def admin_signup():
    data = request.json
    if admin_users.find_one({"email": data["email"]}):
        return jsonify({"message": "Admin already exists"}), 400

    access_code = data.get("adminAccessCode")
    if access_code != "123456789":
        return jsonify({"message": "Invalid Admin Access Code"}), 403

    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    new_admin = {
        "fullName": data.get("fullName"),
        "username": data.get("username"),
        "email": data.get("email"),
        "password": hashed_pw,
        "adminDepartment": data.get("adminDepartment"),
        "role": "admin",
        "createdAt": datetime.datetime.utcnow()
    }

    admin_users.insert_one(new_admin)
    return jsonify({"message": "Admin signup successful"}), 201

# -------------------------------
# DEAF LOGIN
# -------------------------------
@app.route("/deaf/login", methods=["POST"])
def deaf_login():
    data = request.json
    user = deaf_users.find_one({"email": data["email"]})
    if not user or not bcrypt.check_password_hash(user["password"], data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode(
        {"user_id": str(user["_id"]), "role": "deaf",
         "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)},
        app.config["SECRET_KEY"], algorithm="HS256"
    )

    return jsonify({"message": "Deaf user login successful", "token": token, "role": "deaf"}), 200

# -------------------------------
# ADMIN LOGIN
# -------------------------------
@app.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.json
    user = admin_users.find_one({"email": data["email"]})
    if not user or not bcrypt.check_password_hash(user["password"], data["password"]):
        return jsonify({"message": "Invalid admin credentials"}), 401

    token = jwt.encode(
        {"user_id": str(user["_id"]), "role": "admin",
         "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=4)},
        app.config["SECRET_KEY"], algorithm="HS256"
    )

    return jsonify({"message": "Admin login successful", "token": token, "role": "admin"}), 200

# -------------------------------
# VIDEO UPLOAD
# -------------------------------
@app.route("/video", methods=["POST"])
def upload_video():
    if "video" not in request.files:
        return jsonify({"message": "No video file provided"}), 400

    video_file = request.files["video"]
    filename = secure_filename(video_file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    video_file.save(filepath)

    video_data = {
        "signName": request.form.get("signName"),
        "description": request.form.get("description"),
        "difficulty": request.form.get("difficulty"),
        "category": request.form.get("category"),
        "videoUrl": f"/uploads/videos/{filename}",
        "uploadedAt": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        "uploadedBy": request.form.get("uploadedBy", "Admin")
    }

    result = videos.insert_one(video_data)
    video_data["_id"] = str(result.inserted_id)
    return jsonify({"message": "Video uploaded successfully", "video": video_data}), 201

# -------------------------------
# FETCH VIDEOS
# -------------------------------
@app.route("/videos", methods=["GET"])
def get_videos():
    video_list = [
        {
            "_id": str(v["_id"]),
            "signName": v.get("signName"),
            "description": v.get("description"),
            "difficulty": v.get("difficulty"),
            "category": v.get("category"),
            "videoUrl": v.get("videoUrl"),
            "uploadedAt": v.get("uploadedAt"),
            "uploadedBy": v.get("uploadedBy", "Admin")
        }
        for v in videos.find()
    ]
    return jsonify({"videos": video_list}), 200

# -------------------------------
# SERVE VIDEO FILES
# -------------------------------
@app.route("/uploads/videos/<filename>")
def serve_video(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# -------------------------------
# RUN FLASK
# -------------------------------
@app.route("/dashboard/deaf-users", methods=["GET"])
def get_deaf_users():
    users = list(deaf_users.find())
    # Convert ObjectId to string for JSON
    for u in users:
        u["_id"] = str(u["_id"])
    return jsonify({"deafUsers": users}), 200

@app.route("/dashboard/videos", methods=["GET"])
def get_dashboard_videos():
    vids = list(videos.find())
    for v in vids:
        v["_id"] = str(v["_id"])
    return jsonify({"videos": vids}), 200
@app.route("/dashboard/videos-by-category", methods=["GET"])
def videos_by_category():
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    stats = list(videos.aggregate(pipeline))
    return jsonify({"categoryStats": stats}), 200
@app.route("/dashboard/videos-by-difficulty", methods=["GET"])
def videos_by_difficulty():
    pipeline = [
        {"$group": {"_id": "$difficulty", "count": {"$sum": 1}}}
    ]
    stats = list(videos.aggregate(pipeline))
    return jsonify({"difficultyStats": stats}), 200
@app.route("/dashboard/users-by-communication", methods=["GET"])
def users_by_communication():
    pipeline = [
        {"$group": {"_id": "$communicationPreference", "count": {"$sum": 1}}}
    ]
    stats = list(deaf_users.aggregate(pipeline))
    return jsonify({"communicationStats": stats}), 200
@app.route("/dashboard/all-deaf-users", methods=["GET"])
def get_all_deaf_users():
    users = deaf_users.find()
    user_list = []
    for u in users:
        user_list.append({
            "_id": str(u["_id"]),
            "fullName": u.get("fullName"),
            "username": u.get("username"),
            "email": u.get("email"),
            "phone": u.get("phone"),
            "gender": u.get("gender"),
            "dateOfBirth": u.get("dateOfBirth"),
            "preferredSignLanguage": u.get("preferredSignLanguage"),
            "communicationPreference": u.get("communicationPreference"),
            "emergencyContactName": u.get("emergencyContactName"),
            "emergencyContactNumber": u.get("emergencyContactNumber"),
            "medicalNotes": u.get("medicalNotes"),
            "createdAt": u.get("createdAt").strftime("%Y-%m-%d %H:%M") if u.get("createdAt") else None,
            "role": u.get("role", "deaf")
        })
    return jsonify({"allDeafUsers": user_list, "count": len(user_list)}), 200
@app.route("/dashboard/all-videos", methods=["GET"])
def get_all_videos():
    video_list = []
    for v in videos.find():
        video_list.append({
            "_id": str(v["_id"]),
            "signName": v.get("signName"),
            "description": v.get("description"),
            "difficulty": v.get("difficulty"),
            "category": v.get("category"),
            "videoUrl": v.get("videoUrl"),
            "uploadedAt": v.get("uploadedAt"),
            "uploadedBy": v.get("uploadedBy", "Admin"),
        })
    return jsonify({"allVideos": video_list, "count": len(video_list)}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
