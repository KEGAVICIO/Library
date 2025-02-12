from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db import connection
import hashlib


#Diccionario de los perfiles
ROLES_MAP = {
    "visitante": "4",
    "lector": "3",
    "editor": "2",
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
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email")
    role = request.data.get("perfil", "visitante")  # Recibir perfil desde el frontend
    usuario_alt = "Sistema"  # Usuario que da de alta, puedes modificarlo

    # Convertir el rol al número correspondiente
    perfil = ROLES_MAP.get(role, "4")  # Si no encuentra el rol, usa "4" (visitante)

    # Validar si el usuario ya existe
    with connection.cursor() as cursor:
        cursor.execute("SELECT Id FROM usuarios WHERE Usuario = %s", [username])
        existing_user = cursor.fetchone()

    if existing_user:
        return Response({"message": "El usuario ya existe"}, status=400)

    # Insertar en la base de datos
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO usuarios (Usuario, Contra, Correo, Perfil, UsuarioAlt)
                VALUES (%s, %s, %s, %s, %s)
                """,
                [username, password, email, perfil, username]
            )
        return Response({"message": "Usuario registrado con éxito"}, status=201)
    except Exception as e:
        return Response({"message": "Error al registrar usuario", "error": str(e)}, status=400)