package utez.edu.mx


import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast


import androidx.appcompat.app.AppCompatActivity


import com.google.firebase.auth.FirebaseAuth
import utez.edu.mx.R


class Login_Register : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)


        setContentView(R.layout.activity_login_register)


        // Obtener referencias a los elementos de la interfaz de usuario
        val emailEditText = findViewById<EditText>(R.id.emailEditText)
        val passwordEditText = findViewById<EditText>(R.id.passwordEditText)
        val registerButton = findViewById<Button>(R.id.registerButton)
        val loginButton = findViewById<Button>(R.id.loginButton)
        val logoutButton = findViewById<Button>(R.id.logoutButton)


        // Inicializar la instancia de autenticación de Firebase
        val auth = FirebaseAuth.getInstance()


        // Configurar el botón de registro
        registerButton.setOnClickListener {
            val email = emailEditText.text.toString().trim()
            val password = passwordEditText.text.toString().trim()


            //return@setOnClickListener se utiliza para salir del OnClickListener
            // cuando se detecta que falta información requerida (como email o contraseña),
            // evitando que se ejecute el resto del código dentro del OnClickListener
            // y sin detener el resto de la ejecución del método onCreate.


            // Validar que el campo de correo no esté vacío
            if (email.isEmpty()) {
                emailEditText.error = "El correo electrónico es obligatorio"
                emailEditText.requestFocus()
                return@setOnClickListener
            }
            // Validar que el campo de contraseña no esté vacío
            if (password.isEmpty()) {
                passwordEditText.error = "La contraseña es obligatoria"
                passwordEditText.requestFocus()
                return@setOnClickListener
            }
            // Verificar que la contraseña tenga al menos 6 caracteres
            if (password.length < 6) {
                passwordEditText.error = "La contraseña debe tener al menos 6 caracteres"
                passwordEditText.requestFocus()
                return@setOnClickListener
            }
            // Intentar crear un usuario con el correo y la contraseña proporcionados
            auth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        Toast.makeText(this, "Registro exitoso", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(
                            this,
                            "Error en el registro: ${task.exception?.message}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
        }
        // Configurar el botón de inicio de sesión
        loginButton.setOnClickListener {
            val email = emailEditText.text.toString().trim()
            val password = passwordEditText.text.toString().trim()
            // Validar que el campo de correo no esté vacío
            if (email.isEmpty()) {
                emailEditText.error = "El correo electrónico es obligatorio"
                emailEditText.requestFocus()
                return@setOnClickListener
            }
            // Validar que el campo de contraseña no esté vacío
            if (password.isEmpty()) {
                passwordEditText.error = "La contraseña es obligatoria"
                passwordEditText.requestFocus()
                return@setOnClickListener
            }
            // Intentar iniciar sesión con el correo y la contraseña proporcionados
            auth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        Toast.makeText(this, "Inicio de sesión exitoso", Toast.LENGTH_SHORT).show()
                        // Aquí podrías abrir una nueva actividad (MainActivity)
                        // Crear un Intent para abrir P8RealTimeDatabase
                        val intent = Intent(this, MenuVoid::class.java)
                        // Configurar al intent para que cierre la actividad actual y evitar regrsar a ella
                        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
                        startActivity(intent)
                        // Finaliza la ctividad actual para que no quede en el stack
                        finish()
                    } else {
                        Toast.makeText(
                            this,
                            "Error al iniciar sesión: ${task.exception?.message}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
        }
        // Configurar el botón de cierre de sesión
        logoutButton.setOnClickListener {
            auth.signOut()  // Cerrar la sesión de Firebase
            Toast.makeText(this, "Sesión cerrada", Toast.LENGTH_SHORT).show()


            // Redirigir a la LoginActivity
            startActivity(Intent(this, Login_Register::class.java))
            finish()
        }
    }
}
