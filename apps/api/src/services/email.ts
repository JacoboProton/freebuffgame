import nodemailer from 'nodemailer';

// Email configuration - use environment variables in production
const EMAIL_USER = process.env.EMAIL_USER || 'tu-email@gmail.com';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || 'tu-password';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Duobi-Jac <noreply@duobijac.com>';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

interface CourseCompletionEmailData {
  userName: string;
  userEmail: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  totalXP: number;
  completionDate: string;
  totalTimeSpent: string;
}

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

interface DailyProgressEmailData {
  userName: string;
  userEmail: string;
  lessonsCompleted: number;
  xpEarned: number;
  currentStreak: number;
  coursesInProgress: string[];
}

export async function sendCourseCompletionEmail(data: CourseCompletionEmailData) {
  const { userName, userEmail, courseTitle, completedLessons, totalLessons, totalXP, completionDate, totalTimeSpent } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .course-card { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .course-title { font-size: 20px; font-weight: bold; color: #1e293b; margin: 0 0 15px; }
        .stats { display: flex; gap: 15px; flex-wrap: wrap; }
        .stat { background: white; padding: 15px; border-radius: 10px; text-align: center; flex: 1; min-width: 100px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #6366f1; }
        .stat-label { font-size: 12px; color: #64748b; margin-top: 5px; }
        .trophy { font-size: 60px; text-align: center; margin: 20px 0; }
        .message { text-align: center; color: #64748b; font-size: 14px; }
        .footer { text-align: center; padding: 20px; background: #f8fafc; color: #64748b; font-size: 12px; }
        .badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; }
        .badge-success { background: #dcfce7; color: #16a34a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Felicidades, ${userName}!</h1>
          <p>Has completado un curso en Duobi-Jac</p>
        </div>
        
        <div class="content">
          <div class="trophy">🏆</div>
          
          <div class="course-card">
            <h2 class="course-title">${courseTitle}</h2>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-value">${completedLessons}/${totalLessons}</div>
                <div class="stat-label">Lecciones</div>
              </div>
              <div class="stat">
                <div class="stat-value">${totalXP}</div>
                <div class="stat-label">XP Ganado</div>
              </div>
              <div class="stat">
                <div class="stat-value">${totalTimeSpent}</div>
                <div class="stat-label">Tiempo</div>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <span class="badge badge-success">✓ Certificado de finalización</span>
          </div>
          
          <p class="message">
            ¡Sigue así! Tu próximo curso te espera.<br>
            Sigue aprendiendo y desbloquea nuevos logros.
          </p>
        </div>
        
        <div class="footer">
          <p>Duobi-Jac - Aprende Jugando</p>
          <p>Completado el ${completionDate}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: userEmail,
      subject: `🎉 ¡Felicidades! Has completado "${courseTitle}" en Duobi-Jac`,
      html: htmlContent,
    });
    console.log(`✅ Course completion email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const { userName, userEmail } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center; color: white; }
        .content { padding: 30px; text-align: center; }
        .goat { font-size: 80px; }
        h1 { margin: 20px 0 10px; }
        p { color: #64748b; line-height: 1.6; }
        .btn { display: inline-block; background: #6366f1; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="goat">🐐</div>
          <h1>¡Bienvenido, ${userName}!</h1>
          <p>Tu cabrito te espera para empezar la aventura de aprendizaje</p>
        </div>
        <div class="content">
          <p>Con Duobi-Jac aprenderás jugando. Explora cursos, completa lecciones, sube de nivel y desbloquea logros increíbles.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/courses" class="btn">Explorar Cursos</a>
        </div>
        <div class="footer">
          <p>Duobi-Jac - Aprende Jugando</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: userEmail,
      subject: '🐐 ¡Bienvenido a Duobi-Jac! Tu aventura comienza hoy',
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

export async function sendDailyProgressEmail(data: DailyProgressEmailData) {
  const { userName, userEmail, lessonsCompleted, xpEarned, currentStreak, coursesInProgress } = data;

  const coursesList = coursesInProgress.length > 0 
    ? coursesInProgress.map(c => `<li>${c}</li>`).join('')
    : '<li>No hay cursos en progreso</li>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; color: white; }
        .stats { display: flex; justify-content: center; gap: 30px; padding: 20px; }
        .stat { text-align: center; }
        .stat-value { font-size: 32px; font-weight: bold; }
        .stat-label { font-size: 12px; opacity: 0.8; }
        .content { padding: 20px; }
        .courses { background: #f8fafc; border-radius: 10px; padding: 15px; }
        h3 { margin: 0 0 10px; color: #1e293b; }
        ul { margin: 0; padding-left: 20px; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Resumen Diario</h1>
          <p>¡Hola ${userName}! Aquí está tu progreso de hoy</p>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${lessonsCompleted}</div>
            <div class="stat-label">Lecciones</div>
          </div>
          <div class="stat">
            <div class="stat-value">+${xpEarned}</div>
            <div class="stat-label">XP</div>
          </div>
          <div class="stat">
            <div class="stat-value">🔥${currentStreak}</div>
            <div class="stat-label">Racha</div>
          </div>
        </div>
        <div class="content">
          <div class="courses">
            <h3>Cursos en progreso</h3>
            <ul>${coursesList}</ul>
          </div>
        </div>
        <div class="footer">
          <p>Continúa mañana para mantener tu racha</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: userEmail,
      subject: `📊 Tu resumen diario de Duobi-Jac - ${lessonsCompleted} lecciones completadas`,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending daily progress email:', error);
    return { success: false, error };
  }
}

// Check if email is configured
export function isEmailConfigured(): boolean {
  return !!(EMAIL_USER && EMAIL_PASSWORD && EMAIL_USER !== 'tu-email@gmail.com');
}

interface PurchaseConfirmationEmailData {
  userName: string;
  userEmail: string;
  courseTitle: string;
  courseCategory: string;
  courseId: string;
  amountPaid: number;
  paymentId: string;
  purchaseDate: string;
  isManual: boolean;
}

export async function sendPurchaseConfirmationEmail(data: PurchaseConfirmationEmailData) {
  const { userName, userEmail, courseTitle, courseCategory, amountPaid, paymentId, purchaseDate, isManual } = data;

  const formattedAmount = amountPaid > 0 ? `$${(amountPaid / 100).toFixed(2)} USD` : 'Gratuito';
  const verificationType = isManual ? 'Procesamiento Manual' : 'Pago Verificado';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .course-card { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .course-title { font-size: 20px; font-weight: bold; color: #1e293b; margin: 0 0 10px; }
        .course-category { font-size: 14px; color: #64748b; margin: 0; }
        .amount { font-size: 32px; font-weight: bold; color: #6366f1; text-align: center; margin: 20px 0; }
        .amount-label { font-size: 12px; color: #64748b; text-align: center; margin-bottom: 20px; }
        .details { background: white; border-radius: 10px; padding: 15px; margin-bottom: 20px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #64748b; font-size: 14px; }
        .detail-value { color: #1e293b; font-weight: 500; font-size: 14px; }
        .btn { display: block; background: #6366f1; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; text-align: center; margin-top: 20px; font-weight: 600; }
        .manual-badge { display: inline-block; background: #fef3c7; color: #d97706; padding: 5px 15px; border-radius: 20px; font-size: 12px; margin-bottom: 10px; }
        .message { text-align: center; color: #64748b; font-size: 14px; line-height: 1.6; }
        .footer { text-align: center; padding: 20px; background: #f8fafc; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Felicidades, ${userName}!</h1>
          <p>Tu compra ha sido confirmada exitosamente</p>
        </div>
        
        <div class="content">
          ${isManual ? '<span class="manual-badge">⚡ Procesamiento Manual</span>' : ''}
          
          <div class="course-card">
            <h2 class="course-title">${courseTitle}</h2>
            <p class="course-category">${courseCategory}</p>
          </div>
          
          <div class="amount">${formattedAmount}</div>
          <p class="amount-label">Monto pagado</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Tipo de verificación</span>
              <span class="detail-value">${verificationType}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ID de transacción</span>
              <span class="detail-value">${paymentId.substring(0, 20)}${paymentId.length > 20 ? '...' : ''}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha de compra</span>
              <span class="detail-value">${purchaseDate}</span>
            </div>
          </div>
          
          <p class="message">
            Ya tienes acceso al curso. ¡Comienza a aprender ahora y disfruta de todo el contenido!
          </p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/learn/${data.courseId || ''}" class="btn">
            Ir al Curso →
          </a>
        </div>
        
        <div class="footer">
          <p>Duobi-Jac - Aprende Jugando</p>
          <p>Si tienes alguna pregunta, contacta a soporte</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: userEmail,
      subject: `🎉 ¡Confirmado! Tienes acceso a "${courseTitle}" en Duobi-Jac`,
      html: htmlContent,
    });
    console.log(`✅ Purchase confirmation email sent to ${userEmail} for course ${courseTitle}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending purchase confirmation email:', error);
    return { success: false, error };
  }
}