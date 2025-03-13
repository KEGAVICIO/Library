import csv
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db import connection
import hashlib
import base64
from django.core.files.uploadedfile import InMemoryUploadedFile


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
    

# Modificar la función de obtener usuarios para incluir el ID
@api_view(["GET"])
def get_users(request):
    username = request.GET.get("username", "").strip()
    email = request.GET.get("email", "").strip()
    perfil = request.GET.get("perfil", "").strip()
    estado = request.GET.get("estado", "").strip()

    perfil = ROLES_MAP.get(perfil)

    query = """
        SELECT Id, Usuario, Correo, Perfil, Estado 
        FROM usuarios 
        WHERE 1=1
    """
    params = []

    if username:
        query += " AND Usuario LIKE %s"
        params.append(f"%{username}%")
    
    if email:
        query += " AND Correo LIKE %s"
        params.append(f"%{email}%")
    
    if perfil:
        query += " AND Perfil = %s"
        params.append(perfil)
    
    if estado:
        query += " AND Estado = %s"
        params.append(estado)

    with connection.cursor() as cursor:
        cursor.execute(query, params)
        users = cursor.fetchall()

    user_list = [
        {
            "id": user[0],  # Aquí añadimos el ID
            "username": user[1],
            "email": user[2],
            "perfil": DATS_MAP.get(str(user[3]), "Desconocido"),
            "estado": user[4]
        }
        for user in users
    ]

    return Response(user_list, status=200)


# Actualizar usuario
@api_view(["PUT"])
def update_user(request, user_id):
    new_username = request.data.get("username", "").strip().upper()
    password = request.data.get("password", "").strip()
    email = request.data.get("email", "").strip()
    role = request.data.get("perfil", "").strip()
    usuario_alt = request.data.get("usuarioAlt", "SISTEMA").strip().upper()
    estado = request.data.get("estado", None)

    if not new_username or not email or not role:
        return Response({"message": "Usuario, correo y rol son obligatorios"}, status=400)

    perfil = ROLES_MAP.get(role, "4")

    try:
        with connection.cursor() as cursor:
            if estado is not None:
                cursor.execute("""
                    UPDATE usuarios 
                    SET Estado = %s, UsuarioAlt = %s
                    WHERE Id = %s
                """, [estado, usuario_alt, user_id])

            elif password:
                hashed_password = hashlib.sha256(password.encode()).hexdigest()
                cursor.execute("""
                    UPDATE usuarios 
                    SET Usuario = %s, Contra = %s, Correo = %s, Perfil = %s, UsuarioAlt = %s
                    WHERE Id = %s
                """, [new_username, hashed_password, email, perfil, usuario_alt, user_id])
            else:
                cursor.execute("""
                    UPDATE usuarios 
                    SET Usuario = %s, Correo = %s, Perfil = %s, UsuarioAlt = %s
                    WHERE Id = %s
                """, [new_username, email, perfil, usuario_alt, user_id])

        return Response({"message": "Usuario actualizado correctamente"}, status=200)
    except Exception as e:
        return Response({"message": f"Error al actualizar usuario: {str(e)}"}, status=400)


#--------------------------------------------------------------------------------------------------
#               CARGA DE LIBROS
#--------------------------------------------------------------------------------------------------
@api_view(["POST"])
def registrar_libro(request):
    titulo = request.data.get("titulo", "").strip()
    autor = request.data.get("autor", "").strip()
    resena = request.data.get("resena", "").strip()
    imagen = request.FILES.get("imagen")  # Recibir la imagen
    usuario_alt = request.data.get("usuarioAlt", "SISTEMA").strip().upper()

    # Validar campos obligatorios
    if not titulo or not autor or not resena or not imagen:
        return Response({"message": "Todos los campos son obligatorios"}, status=400)

    # Leer la imagen en binario para almacenarla en MySQL
    imagen_binario = imagen.read()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT * FROM libros WHERE Titulo = %s AND Autor = %s
                """, 
                [titulo, autor]
            )
            existing_book = cursor.fetchone()  # Verifica si ya existe un libro

            if existing_book:
                return Response({"message": "Este libro ya está registrado"}, status=400)

            cursor.execute(
                """
                INSERT INTO libros (Titulo, Autor, Resena, Vistas, Estado, UsuarioAlt, Imagen)
                VALUES (%s, %s, %s, 1, '0', %s, %s)
                """,
                [titulo, autor, resena, usuario_alt, imagen_binario]
            )
        return Response({"message": "Libro registrado exitosamente"}, status=201)
    except Exception as e:
        return Response({"message": f"Error al registrar libro: {str(e)}"}, status=400)

@api_view(["GET"])
def get_books(request):
    titulo = request.GET.get("titulo", "").strip()
    autor = request.GET.get("autor", "").strip()
    estado = request.GET.get("estado", "").strip()

    query = """
        SELECT IdLibro, Titulo, Autor, Resena, Vistas, Estado, Imagen 
        FROM libros 
        WHERE 1=1
    """
    params = []

    if titulo:
        query += " AND Titulo LIKE %s"
        params.append(f"%{titulo}%")
    
    if autor:
        query += " AND Autor LIKE %s"
        params.append(f"%{autor}%")
    
    if estado:
        query += " AND Estado = %s"
        params.append(estado)

    with connection.cursor() as cursor:
        cursor.execute(query, params)
        books = cursor.fetchall()

    book_list = [
        {
            "id": book[0],
            "titulo": book[1],
            "autor": book[2],
            "resena": book[3],
            "vistas": book[4],
            "estado": book[5],
            "imagen": base64.b64encode(book[6]).decode('utf-8') if book[6] else None
        }
        for book in books
    ]

    return Response(book_list, status=200)

@api_view(["PUT"])
def update_book(request, book_id):
    titulo = request.data.get("titulo", "").strip().upper()
    autor = request.data.get("autor", "").strip()
    resena = request.data.get("resena", "").strip()
    usuario_alt = request.data.get("usuarioAlt", "SISTEMA").strip().upper()
    estado = request.data.get("estado", None)
    imagen = request.FILES.get("imagen", None)  # Obtiene la imagen si existe

    if not titulo or not autor or not resena:
        return Response({"message": "Título, autor y reseña son obligatorios"}, status=400)

    try:
        with connection.cursor() as cursor:
            if imagen:
                cursor.execute("""
                    UPDATE libros
                    SET Titulo = %s, Autor = %s, Resena = %s, Imagen = %s, UsuarioAlt = %s
                    WHERE IdLibro = %s
                """, [titulo, autor, resena, imagen.read(), usuario_alt, book_id])
            elif estado is not None:
                cursor.execute("""
                    UPDATE libros
                    SET Estado = %s, UsuarioAlt = %s
                    WHERE IdLibro = %s
                """, [estado, usuario_alt, book_id])
            else:
                cursor.execute("""
                    UPDATE libros
                    SET Titulo = %s, Autor = %s, Resena = %s, UsuarioAlt = %s
                    WHERE IdLibro = %s
                """, [titulo, autor, resena, usuario_alt, book_id])
            
        return Response({"message": "Libro actualizado correctamente"}, status=200)
    except Exception as e:
        return Response({"message": f"Error al actualizar libro: {str(e)}"}, status=400)

@api_view(["POST"])
def carga_masiva_libros(request):
    archivo = request.FILES.get("file")  # Obtener el archivo CSV
    usuario_alt = request.POST.get("usuarioAlt", "").strip()  # Obtener el usuarioAlt

    if not archivo:
        return Response({"message": "No se proporcionó ningún archivo"}, status=400)

    if not usuario_alt:
        return Response({"message": "No se proporcionó el usuario alternativo (usuarioAlt)"}, status=400)

    try:
        # Leer el archivo CSV
        file_content = archivo.read().decode("ISO-8859-1")  # Leer el contenido del archivo
        reader = csv.DictReader(file_content.splitlines())  # Usar DictReader para tratarlo como un diccionario

        for row in reader:
            titulo = row.get("Titulo", "").strip().upper()
            autor = row.get("Autor", "").strip()
            resena = row.get("Resena", "").strip()
            imagen_base64 = row.get("Imagen", "").strip()  # Obtener la cadena Base64 de la imagen

            if not titulo or not autor or not resena:
                continue  # Si hay campos vacíos, saltamos este registro

            # Verificar si ya existe el libro con el mismo título y autor
            try:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT * FROM libros WHERE Titulo = %s AND Autor = %s
                        """, 
                        [titulo, autor]
                    )
                    existing_book = cursor.fetchone()  # Verifica si ya existe un libro

                    if existing_book:
                        print(f"El libro '{titulo}' de {autor} ya está registrado. Se omite.")
                        continue  # Si el libro ya está registrado, saltamos a la siguiente iteración
            except Exception as e:
                return Response({"message": f"Error al verificar el libro: {str(e)}"}, status=400)

            # Decodificar la imagen de Base64, si está presente
            imagen_binaria = None  # Asignar None si no hay imagen
            if imagen_base64:
                try:
                    imagen_binaria = base64.b64decode(imagen_base64.split(',')[1])  # Eliminar el prefijo "data:image/jpeg;base64,"
                except Exception as e:
                    return Response({"message": f"Error al decodificar la imagen: {str(e)}"}, status=400)

            # Insertar en la base de datos
            try:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        INSERT INTO libros (Titulo, Autor, Resena, UsuarioAlt, Imagen)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        [titulo, autor, resena, usuario_alt, imagen_binaria]
                    )
            except Exception as e:
                return Response({"message": f"Error al insertar el libro: {str(e)}"}, status=400)

        return Response({"message": "Libros registrados exitosamente"}, status=201)

    except Exception as e:
        return Response({"message": f"Error al procesar el archivo: {str(e)}"}, status=400)

#--------------------------------------------------------------------------------------------------
#               Principal
#--------------------------------------------------------------------------------------------------
@api_view(["GET"])
def get_mainbooks(request):
    titulo = request.GET.get("titulo", "").strip()
    autor = request.GET.get("autor", "").strip()
    estado = request.GET.get("estado", "").strip()

    query = """
        SELECT IdLibro, Titulo, Autor, Resena, Vistas, Estado, Imagen 
        FROM libros 
        WHERE Estado = 0
    """
    params = []

    if titulo:
        query += " AND Titulo LIKE %s"
        params.append(f"%{titulo}%")
    
    if autor:
        query += " AND Autor LIKE %s"
        params.append(f"%{autor}%")
    
    if estado:
        query += " AND Estado = %s"
        params.append(estado)

    with connection.cursor() as cursor:
        cursor.execute(query, params)
        books = cursor.fetchall()

    book_list = [
        {
            "id": book[0],
            "titulo": book[1],
            "autor": book[2],
            "resena": book[3],
            "vistas": book[4],
            "estado": book[5],
            "imagen": base64.b64encode(book[6]).decode('utf-8') if book[6] else None
        }
        for book in books
    ]

    return Response(book_list, status=200)

#--------------------------------------------------------------------------------------------------
#               Perfil
#--------------------------------------------------------------------------------------------------
@api_view(["GET"])
def get_user(request, user_id):
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT Id, Usuario, Correo, Perfil FROM usuarios WHERE Id = %s AND Estado = '0'",
            [user_id]
        )
        user = cursor.fetchone()

    if user:
        return Response({
            "id": user[0],
            "usuario": user[1],
            "correo": user[2],
            "perfil": DATS_MAP.get(str(user[3]), "Desconocido"),
        })
    else:
        return Response({"error": "Usuario no encontrado o inactivo"}, status=404)