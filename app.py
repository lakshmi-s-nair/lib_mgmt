from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user

app = Flask(__name__)
app.secret_key = 'my_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///library.db'
app.config['SESSION_COOKIE_SECURE'] = True
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'index'

####db
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(200), nullable=False)

####
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password=hashed_password, role=data['role'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        login_user(user, remember=True)  
        return jsonify({"message": "Login successful", "role": user.role})
    return jsonify({"message": "Invalid credentials"}), 401


@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"})




@app.route('/add_book', methods=['POST'])
@login_required
def add_book():
    if current_user.role != 'admin':
        return jsonify({"message": "Unauthorized"}), 403
    data = request.json
    book = Book(title=data['title'], author=data['author'])
    db.session.add(book)
    db.session.commit()
    return jsonify({"message": "Book added successfully"})




@app.route('/delete_book', methods=['POST'])
@login_required
def del_book():
    if current_user.role != 'admin':
        return jsonify({"message": "Unauthorized"}), 403
    data = request.json
    book = Book.query.filter_by(title=data['title'], author=data['author']).first()
    if book:
        db.session.delete(book)
        db.session.commit()
        return jsonify({"message": "Book successfully deleted"})
    else:
        return jsonify({"message": "Book not found"}), 404


# @app.route('/search_book', methods=['GET'])
# @login_required
# def search_book():
#     query = request.args.get('query', '').strip()
#     if not query:
#         return jsonify({"message": "Query parameter is required"}), 400

#     books = Book.query.filter((Book.title.ilike(f"%{query}%")) | (Book.author.ilike(f"%{query}%"))).all()

#     if books:
#         book_list = [{"id": book.id, "title": book.title, "author": book.author} for book in books]
#         return jsonify(book_list)
#     else:
#         return jsonify({"message": "No books found"}), 404



@app.route('/books', methods=['GET'])
@login_required
def get_books():
    books = Book.query.all()
    book_list = [{"id": book.id, "title": book.title, "author": book.author} for book in books]
    return jsonify(book_list)


@app.route('/users', methods=['GET'])
@login_required
def get_users():
    if current_user.role != 'admin':
        return jsonify({"message": "Unauthorized"}), 403
    users = User.query.all()
    user_list = [{"id": user.id, "username": user.username, "role": user.role} for user in users]
    return jsonify(user_list)



if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)


