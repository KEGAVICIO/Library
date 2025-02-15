from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db import connection
import hashlib


#Diccionario de los perfiles
ROLES_MAP = {
    "visitante": "4",
    "lector": "3",
    "editor": "2",
    "administrador": "1",
}

DATS_MAP = {
    "4": "visitante",
    "3": "lector",
    "2": "editor",
    "1": "administrador",
}

#aqui accedemos a la pagina
@api_view(["POST"])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    # Hashear la contraseña como en MySQL (SHA2-256)
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT Id, Usuario, Perfil FROM usuarios WHERE Usuario = %s AND Contra = %s AND Estado = '0'",
            [username, hashed_password]
        )
        user = cursor.fetchone()

    if user:
        id, usuario, perfil = user
        return Response({"message": "Login exitoso", "perfil": perfil, "usuario": usuario, "id": id}, status=200)
    else:
        return Response({"message": "Credenciales incorrectas"}, status=401)


#aqui es para registrarnos
@api_view(["POST"])
def register_user(request):
    username = request.data.get("username", "").strip().upper()
    password = request.data.get("password", "").strip()
    email = request.data.get("email", "").strip()
    role = request.data.get("perfil", "").strip()  # Recibir perfil desde el frontend

     # Validación de campos obligatorios
    if not username or not password or not email:
        return Response({"message": "Todos los campos son obligatorios"}, status=400)

    if request.user.is_authenticated:
        usuario_alt = request.user.username.upper()
    else:
        usuario_alt = "SISTEMA"

    # Convertir el rol al número correspondiente
    perfil = ROLES_MAP.get(role, "4")  # Si no encuentra el rol, usa "4" (visitante)

    # Validar si el usuario ya existe
    with connection.cursor() as cursor:
        cursor.execute("SELECT Id FROM usuarios WHERE Usuario = %s OR Correo = %s", [username, email])
        existing_user = cursor.fetchone()

    if existing_user:
        return Response({"message": "Usuario o correo ya están en uso"}, status=400)

    # Insertar en la base de datos
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO usuarios (Usuario, Contra, Correo, Perfil, UsuarioAlt)
                VALUES (%s, %s, %s, %s, %s)
                """,
                [username, password, email, perfil, usuario_alt]
            )
        return Response({"message": "Registro exitoso"}, status=201)
    except Exception as e:
        return Response({"message": "Error al registrar usuario"}, status=400)
    

#para consultar los usuarios
@api_view(["GET"])
def get_users(request):
    # Consultar todos los usuarios en la base de datos
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT Usuario, Correo, Perfil, Contra 
            FROM usuarios
        """)
        users = cursor.fetchall()

    # Convertir la respuesta a JSON
    user_list = [
        {
            "username": user[0],
            "email": user[1],
            "perfil": DATS_MAP.get(str(user[2]), "Desconocido"),  # Convertir el número del perfil a texto
        }
        for user in users
    ]

    return Response(user_list, status=200)