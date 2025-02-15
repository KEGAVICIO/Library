from django.urls import path
from .views import login_view, register_user, get_users

urlpatterns = [
    path('login/', login_view),  # Nueva ruta para login
    path("register/", register_user, name="register"),
    path("users/", get_users, name="get_users"),
]