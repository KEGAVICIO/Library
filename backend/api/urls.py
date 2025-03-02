from django.urls import path
from .views import login_view, register_user, get_users, update_user, registrar_libro, get_books, update_book, carga_masiva_libros

urlpatterns = [
    path('login/', login_view),  # Nueva ruta para login
    path("register/", register_user, name="register"),
    path("users/", get_users, name="get_users"),
    path("users/<int:user_id>/", update_user, name="update_user"),
    path("libros/", registrar_libro, name="registrar_libro"),
    path("libros/lista/", get_books, name="get_books"),
    path("libros/<int:book_id>/", update_book, name="update_book"),
    path("libros/carga_masiva/", carga_masiva_libros, name="carga_masiva_libros")
]