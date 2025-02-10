from django.urls import path
from .views import login_view
from .views import register_user

urlpatterns = [
    path('login/', login_view),  # Nueva ruta para login
    path("register/", register_user, name="register"),
]