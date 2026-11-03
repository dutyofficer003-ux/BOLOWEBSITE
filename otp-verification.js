/**
 * OTP Verification & Device Security System
 * Handles 6-digit email verification via Brevo API and unrecognized browser detection.
 * Includes complete multi-language support across all 13 supported languages.
 */

// =========================================================================
// MULTILINGUAL OTP TRANSLATION DICTIONARY (13 LANGUAGES)
// English (en), Portuguese (pt), Spanish (es), French (fr), German (de),
// Italian (it), Japanese (ja), Chinese (zh), Dutch (nl), Serbian (sr),
// Turkish (tr), Russian (ru), Arabic (ar)
// =========================================================================
const otpTranslations = {
    en: {
        titles: {
            device: 'NEW BROWSER DETECTED',
            payment: 'PAYMENT GATEWAY VERIFICATION',
            approval: 'ACCOUNT APPROVED & READY',
            login: 'EMAIL VERIFICATION'
        },
        descriptions: {
            device: "For your security, we sent a 6-digit verification code to your email address below. Please check your inbox and enter the code to confirm it's you.",
            payment: 'You are linking or updating a payout gateway method. Enter the 6-digit authorization code dispatched to:',
            approval: 'Your application has been approved! Enter the 6-digit activation code dispatched to:',
            login: 'For your security, we sent a 6-digit verification code to your email address below. Please check your inbox and enter the code to confirm it\'s you.'
        },
        verify_btn: 'VERIFY & AUTHORIZE',
        verifying: 'VERIFYING...',
        resend_prompt: "Didn't receive the email code?",
        resend_btn: 'Resend Code',
        resend_sending: 'Sending...',
        resend_available_in: 'Resend available in',
        cancel_btn: 'Cancel',
        close_title: 'Close',
        success_verified: 'Code verified successfully!',
        success_proceeding: 'Code verified successfully! Proceeding...',
        err_6digits: 'Please enter all 6 digits.',
        err_invalid: 'Invalid code. Please try again.',
        err_expired: 'Verification failed. Incorrect or expired code.',
        err_generic: 'Verification failed. Please check the code and try again.',
        err_dispatch: 'Email dispatch error:'
    },
    pt: {
        titles: {
            device: 'NOVO NAVEGADOR DETETADO',
            payment: 'VERIFICAÇÃO DA CARTEIRA DE PAGAMENTO',
            approval: 'CONTA APROVADA E PRONTA',
            login: 'VERIFICAÇÃO DE E-MAIL'
        },
        descriptions: {
            device: 'Para sua segurança, enviámos um código de verificação de 6 dígitos para o seu e-mail abaixo. Por favor, verifique a sua caixa de entrada e introduza o código para confirmar a sua identidade.',
            payment: 'Está a vincular ou atualizar um método de pagamento. Introduza o código de autorização de 6 dígitos enviado para:',
            approval: 'A sua candidatura foi aprovada! Introduza o código de ativação de 6 dígitos enviado para:',
            login: 'Para sua segurança, enviámos um código de verificação de 6 dígitos para o seu e-mail abaixo. Por favor, verifique a sua caixa de entrada e introduza o código para confirmar a sua identidade.'
        },
        verify_btn: 'VERIFICAR E AUTORIZAR',
        verifying: 'A VERIFICAR...',
        resend_prompt: 'Não recebeu o código por e-mail?',
        resend_btn: 'Reenviar Código',
        resend_sending: 'A enviar...',
        resend_available_in: 'Reenvio disponível em',
        cancel_btn: 'Cancelar',
        close_title: 'Fechar',
        success_verified: 'Código verificado com sucesso!',
        success_proceeding: 'Código verificado com sucesso! A processar...',
        err_6digits: 'Por favor, introduza todos os 6 dígitos.',
        err_invalid: 'Código inválido. Por favor, tente novamente.',
        err_expired: 'Falha na verificação. Código incorreto ou expirado.',
        err_generic: 'Falha na verificação. Verifique o código e tente novamente.',
        err_dispatch: 'Erro no envio de e-mail:'
    },
    es: {
        titles: {
            device: 'NUEVO NAVEGADOR DETECTADO',
            payment: 'VERIFICACIÓN DE PASARELA DE PAGO',
            approval: 'CUENTA APROBADA Y LISTA',
            login: 'VERIFICACIÓN DE CORREO'
        },
        descriptions: {
            device: 'Por su seguridad, enviamos un código de verificación de 6 dígitos a su dirección de correo electrónico a continuación. Por favor revise su bandeja de entrada e ingrese el código para confirmar su identidad.',
            payment: 'Está vinculando o actualizando un método de pago. Ingrese el código de autorización de 6 dígitos enviado a:',
            approval: '¡Su solicitud ha sido aprobada! Ingrese el código de activación de 6 dígitos enviado a:',
            login: 'Por su seguridad, enviamos un código de verificación de 6 dígitos a su dirección de correo electrónico a continuación. Por favor revise su bandeja de entrada e ingrese el código para confirmar su identidad.'
        },
        verify_btn: 'VERIFICAR Y AUTORIZAR',
        verifying: 'VERIFICANDO...',
        resend_prompt: '¿No recibió el código de correo?',
        resend_btn: 'Reenviar Código',
        resend_sending: 'Enviando...',
        resend_available_in: 'Reenvío disponible en',
        cancel_btn: 'Cancelar',
        close_title: 'Cerrar',
        success_verified: '¡Código verificado con éxito!',
        success_proceeding: '¡Código verificado con éxito! Continuando...',
        err_6digits: 'Por favor ingrese los 6 dígitos.',
        err_invalid: 'Código no válido. Inténtelo de nuevo.',
        err_expired: 'Falló la verificación. Código incorrecto o caducado.',
        err_generic: 'Falló la verificación. Compruebe el código y vuelva a intentarlo.',
        err_dispatch: 'Error de envío de correo:'
    },
    fr: {
        titles: {
            device: 'NOUVEAU NAVIGATEUR DÉTECTÉ',
            payment: 'VÉRIFICATION DE LA PASSERELLE DE PAIEMENT',
            approval: 'COMPTE APPROUVÉ ET PRÊT',
            login: 'VÉRIFICATION D\'E-MAIL'
        },
        descriptions: {
            device: 'Pour votre sécurité, nous avons envoyé un code de vérification à 6 chiffres à votre adresse e-mail ci-dessous. Veuillez vérifier votre boîte de réception et saisir le code pour confirmer votre identité.',
            payment: 'Vous liez ou mettez à jour un mode de paiement. Entrez le code d\'autorisation à 6 chiffres envoyé à :',
            approval: 'Votre demande a été approuvée ! Entrez le code d\'activation à 6 chiffres envoyé à :',
            login: 'Pour votre sécurité, nous avons envoyé un code de vérification à 6 chiffres à votre adresse e-mail ci-dessous. Veuillez vérifier votre boîte de réception et saisir le code pour confirmer votre identité.'
        },
        verify_btn: 'VÉRIFIER ET AUTORISER',
        verifying: 'VÉRIFICATION...',
        resend_prompt: 'Vous n\'avez pas reçu le code par e-mail ?',
        resend_btn: 'Renvoyer le Code',
        resend_sending: 'Envoi en cours...',
        resend_available_in: 'Renvoi disponible dans',
        cancel_btn: 'Annuler',
        close_title: 'Fermer',
        success_verified: 'Code vérifié avec succès !',
        success_proceeding: 'Code vérifié avec succès ! Poursuite...',
        err_6digits: 'Veuillez saisir les 6 chiffres.',
        err_invalid: 'Code invalide. Veuillez réessayer.',
        err_expired: 'Échec de la vérification. Code incorrect ou expiré.',
        err_generic: 'Échec de la vérification. Veuillez vérifier le code et réessayer.',
        err_dispatch: 'Erreur d\'envoi d\'e-mail :'
    },
    de: {
        titles: {
            device: 'NEUER BROWSER ERKANNT',
            payment: 'VERIFIZIERUNG DES ZAHLUNGS-GATEWAYS',
            approval: 'KONTO BESTÄTIGT & BEREIT',
            login: 'E-MAIL-VERIFIZIERUNG'
        },
        descriptions: {
            device: 'Zu Ihrer Sicherheit haben wir einen 6-stelligen Bestätigungscode an Ihre unten stehende E-Mail-Adresse gesendet. Bitte überprüfen Sie Ihren Posteingang und geben Sie den Code ein, um Ihre Identität zu bestätigen.',
            payment: 'Sie verknüpfen oder aktualisieren eine Auszahlungsmethode. Geben Sie den 6-stelligen Autorisierungscode ein, gesendet an:',
            approval: 'Ihr Antrag wurde genehmigt! Geben Sie den 6-stelligen Aktivierungscode ein, gesendet an:',
            login: 'Zu Ihrer Sicherheit haben wir einen 6-stelligen Bestätigungscode an Ihre unten stehende E-Mail-Adresse gesendet. Bitte überprüfen Sie Ihren Posteingang und geben Sie den Code ein, um Ihre Identität zu bestätigen.'
        },
        verify_btn: 'VERIFIZIEREN & AUTORISIEREN',
        verifying: 'VERIFIZIERUNG...',
        resend_prompt: 'E-Mail-Code nicht erhalten?',
        resend_btn: 'Code erneut senden',
        resend_sending: 'Wird gesendet...',
        resend_available_in: 'Erneutes Senden verfügbar in',
        cancel_btn: 'Abbrechen',
        close_title: 'Schließen',
        success_verified: 'Code erfolgreich bestätigt!',
        success_proceeding: 'Code erfolgreich bestätigt! Weiterleitung...',
        err_6digits: 'Bitte geben Sie alle 6 Ziffern ein.',
        err_invalid: 'Ungültiger Code. Bitte versuchen Sie es erneut.',
        err_expired: 'Verifizierung fehlgeschlagen. Falscher oder abgelaufener Code.',
        err_generic: 'Verifizierung fehlgeschlagen. Bitte Code prüfen und erneut versuchen.',
        err_dispatch: 'Fehler beim E-Mail-Versand:'
    },
    it: {
        titles: {
            device: 'NUOVO BROWSER RILEVATO',
            payment: 'VERIFICA GATEWAY DI PAGAMENTO',
            approval: 'ACCOUNT APPROVATO E PRONTO',
            login: 'VERIFICA E-MAIL'
        },
        descriptions: {
            device: 'Per la tua sicurezza, abbiamo inviato un codice di verifica a 6 cifre al tuo indirizzo email qui sotto. Controlla la tua casella di posta e inserisci il codice per confermare la tua identità.',
            payment: 'Stai collegando o aggiornando un metodo di pagamento. Inserisci il codice di autorizzazione a 6 cifre inviato a:',
            approval: 'La tua richiesta è stata approvata! Inserisci il codice di attivazione a 6 cifre inviato a:',
            login: 'Per la tua sicurezza, abbiamo inviato un codice di verifica a 6 cifre al tuo indirizzo email qui sotto. Controlla la tua casella di posta e inserisci il codice per confermare la tua identità.'
        },
        verify_btn: 'VERIFICA E AUTORIZZA',
        verifying: 'VERIFICA IN CORSO...',
        resend_prompt: 'Non hai ricevuto il codice via email?',
        resend_btn: 'Reinvia Codice',
        resend_sending: 'Invio in corso...',
        resend_available_in: 'Nuovo invio disponibile tra',
        cancel_btn: 'Annulla',
        close_title: 'Chiudi',
        success_verified: 'Codice verificato con successo!',
        success_proceeding: 'Codice verificato con successo! Avanzamento...',
        err_6digits: 'Inserisci tutte le 6 cifre.',
        err_invalid: 'Codice non valido. Riprova.',
        err_expired: 'Verifica fallita. Codice errato o scaduto.',
        err_generic: 'Verifica fallita. Controlla il codice e riprova.',
        err_dispatch: 'Errore invio e-mail:'
    },
    ja: {
        titles: {
            device: '新しいブラウザが検出されました',
            payment: '決済ゲートウェイの確認',
            approval: 'アカウントが承認されました',
            login: 'メール認証'
        },
        descriptions: {
            device: 'セキュリティ保護のため、下記のメールアドレスに6桁の確認コードを送信しました。受信トレイを確認し、コードを入力して本人確認を完了してください。',
            payment: '出金ゲートウェイ方法の連携または更新を行っています。以下に送信された6桁の認証コードを入力してください：',
            approval: '申請が承認されました！以下に送信された6桁のアクティベーションコードを入力してください：',
            login: 'セキュリティ保護のため、下記のメールアドレスに6桁の確認コードを送信しました。受信トレイを確認し、コードを入力して本人確認を完了してください。'
        },
        verify_btn: '確認して承認する',
        verifying: '確認中...',
        resend_prompt: 'メールコードが届きませんか？',
        resend_btn: 'コードを再送信',
        resend_sending: '送信中...',
        resend_available_in: '再送信可能まで',
        cancel_btn: 'キャンセル',
        close_title: '閉じる',
        success_verified: 'コードが正常に確認されました！',
        success_proceeding: 'コードが正常に確認されました！処理を続行中...',
        err_6digits: '6桁の数字をすべて入力してください。',
        err_invalid: '無効なコードです。もう一度お試しください。',
        err_expired: '認証に失敗しました。コードが正しくないか期限切れです。',
        err_generic: '認証に失敗しました。コードを確認して再試行してください。',
        err_dispatch: 'メール送信エラー：'
    },
    zh: {
        titles: {
            device: '检测到新浏览器',
            payment: '支付网关验证',
            approval: '账户已批准并就绪',
            login: '邮箱安全验证'
        },
        descriptions: {
            device: '为了您的账户安全，我们已向您下方的邮箱发送了6位数验证码。请检查收件箱并输入验证码以确认您的身份。',
            payment: '您正在绑定或更新提现网关方式。请输入发送至以下地址的6位授权码：',
            approval: '您的申请已获得正式批准！请输入发送至以下地址的6位激活码：',
            login: '为了您的账户安全，我们已向您下方的邮箱发送了6位数验证码。请检查收件箱并输入验证码以确认您的身份。'
        },
        verify_btn: '验证并授权',
        verifying: '正在验证...',
        resend_prompt: '没有收到验证码邮件？',
        resend_btn: '重新发送验证码',
        resend_sending: '正在发送...',
        resend_available_in: '重新发送倒计时',
        cancel_btn: '取消',
        close_title: '关闭',
        success_verified: '验证码验证成功！',
        success_proceeding: '验证码验证成功！正在进入...',
        err_6digits: '请输入完整的6位数字验证码。',
        err_invalid: '验证码无效，请重试。',
        err_expired: '验证失败。验证码错误或已过期。',
        err_generic: '验证失败。请检查验证码并重试。',
        err_dispatch: '邮件发送错误：'
    },
    nl: {
        titles: {
            device: 'NIEUWE BROWSER GEDETECTEERD',
            payment: 'VERIFICATIE BETALINGSGATEWAY',
            approval: 'ACCOUNT GOEDGEKEURD & GEREED',
            login: 'E-MAILVERIFICATIE'
        },
        descriptions: {
            device: 'Voor uw veiligheid hebben we een 6-cijferige verificatiecode gestuurd naar uw onderstaande e-mailadres. Controleer uw inbox en voer de code in om te bevestigen dat u het bent.',
            payment: 'U koppelt of wijzigt een uitbetalingsmethode. Voer de 6-cijferige autorisatiecode in verzonden naar:',
            approval: 'Uw aanvraag is goedgekeurd! Voer de 6-cijferige activeringscode in verzonden naar:',
            login: 'Voor uw veiligheid hebben we een 6-cijferige verificatiecode gestuurd naar uw onderstaande e-mailadres. Controleer uw inbox en voer de code in om te bevestigen dat u het bent.'
        },
        verify_btn: 'VERIFIËREN & AUTORISEREN',
        verifying: 'VERIFIËREN...',
        resend_prompt: 'Geen e-mailcode ontvangen?',
        resend_btn: 'Code opnieuw verzenden',
        resend_sending: 'Verzenden...',
        resend_available_in: 'Opnieuw verzenden beschikbaar over',
        cancel_btn: 'Annuleren',
        close_title: 'Sluiten',
        success_verified: 'Code succesvol geverifieerd!',
        success_proceeding: 'Code succesvol geverifieerd! Bezig met doorgaan...',
        err_6digits: 'Voer alle 6 cijfers in.',
        err_invalid: 'Ongeldige code. Probeer het opnieuw.',
        err_expired: 'Verificatie mislukt. Onjuiste of verlopen code.',
        err_generic: 'Verificatie mislukt. Controleer de code en probeer het opnieuw.',
        err_dispatch: 'Fout bij verzenden e-mail:'
    },
    sr: {
        titles: {
            device: 'ОТКРИВЕН НОВИ ПРЕГЛЕДАЧ',
            payment: 'ВЕРИФИКАЦИЈА ГАТЕВАИ-А ЗА ПЛАЋАЊЕ',
            approval: 'НАЛОГ ОДОБРЕН И СПРЕМАН',
            login: 'ВЕРИФИКАЦИЈА ИМЕЈЛА'
        },
        descriptions: {
            device: 'Ради ваше безбедности, послали смо шестоцифрени верификациони код на вашу имејл адресу испод. Проверите пријемно сандуче и унесите код да потврдите свој идентитет.',
            payment: 'Повезујете или ажурирате начин исплате. Унесите шестоцифрени ауторизациони код послат на:',
            approval: 'Ваша пријава је одобрена! Унесите шестоцифрени активациони код послат на:',
            login: 'Ради ваше безбедности, послали смо шестоцифрени верификациони код на вашу имејл адресу испод. Проверите пријемно сандуче и унесите код да потврдите свој идентитет.'
        },
        verify_btn: 'ВЕРИФИКУЈ И АУТОРИЗУЈ',
        verifying: 'ВЕРИФИКАЦИЈА У ТОКУ...',
        resend_prompt: 'Нисте добили имејл код?',
        resend_btn: 'Поново Пошаљи Код',
        resend_sending: 'Шаље се...',
        resend_available_in: 'Поновно слање доступно за',
        cancel_btn: 'Откажи',
        close_title: 'Затвори',
        success_verified: 'Код је успешно верификован!',
        success_proceeding: 'Код је успешно верификован! Наставља се...',
        err_6digits: 'Унесите свих 6 цифара.',
        err_invalid: 'Неважећи код. Покушајте поново.',
        err_expired: 'Верификација није успела. Нетачан или истекао код.',
        err_generic: 'Верификација није успела. Проверите код и покушајте поново.',
        err_dispatch: 'Грешка при слању имејла:'
    },
    tr: {
        titles: {
            device: 'YENİ TARAYICI ALGILANDI',
            payment: 'ÖDEME AĞ GEÇİDİ DOĞRULAMASI',
            approval: 'HESAP ONAYLANDI VE HAZIR',
            login: 'E-POSTA DOĞRULAMASI'
        },
        descriptions: {
            device: 'Güvenliğiniz için aşağıdaki e-posta adresinize 6 haneli bir doğrulama kodu gönderdik. Lütfen gelen kutunuzu kontrol edin ve siz olduğunuzu onaylamak için kodu girin.',
            payment: 'Bir ödeme yöntemi bağlıyor veya güncelliyorsunuz. Şuraya gönderilen 6 haneli yetkilendirme kodunu girin:',
            approval: 'Başvurunuz onaylandı! Şuraya gönderilen 6 haneli aktivasyon kodunu girin:',
            login: 'Güvenliğiniz için aşağıdaki e-posta adresinize 6 haneli bir doğrulama kodu gönderdik. Lütfen gelen kutunuzu kontrol edin ve siz olduğunuzu onaylamak için kodu girin.'
        },
        verify_btn: 'DOĞRULA VE YETKİLENDİR',
        verifying: 'DOĞRULANIYOR...',
        resend_prompt: 'E-posta kodunu almadınız mı?',
        resend_btn: 'Kodu Tekrar Gönder',
        resend_sending: 'Gönderiliyor...',
        resend_available_in: 'Yeniden gönderim süresi:',
        cancel_btn: 'İptal',
        close_title: 'Kapat',
        success_verified: 'Kod başarıyla doğrulandı!',
        success_proceeding: 'Kod başarıyla doğrulandı! Devam ediliyor...',
        err_6digits: 'Lütfen 6 hanenin tümünü girin.',
        err_invalid: 'Geçersiz kod. Lütfen tekrar deneyin.',
        err_expired: 'Doğrulama başarısız. Hatalı veya süresi dolmuş kod.',
        err_generic: 'Doğrulama başarısız. Lütfen kodu kontrol edip tekrar deneyin.',
        err_dispatch: 'E-posta gönderme hatası:'
    },
    ru: {
        titles: {
            device: 'ОБНАРУЖЕН НОВЫЙ БРАУЗЕР',
            payment: 'ВЕРИФИКАЦИЯ ПЛАТЕЖНОГО ШЛЮЗА',
            approval: 'АККАУНТ ОДОБРЕН И ГОТОВ',
            login: 'ПОДТВЕРЖДЕНИЕ EMAIL'
        },
        descriptions: {
            device: 'В целях вашей безопасности мы отправили 6-значный код подтверждения на указанный ниже адрес электронной почты. Пожалуйста, проверьте входящие и введите код, чтобы подтвердить свою личность.',
            payment: 'Вы привязываете или обновляете способ выплат. Введите 6-значный код авторизации, отправленный на:',
            approval: 'Ваша заявка одобрена! Введите 6-значный код активации, отправленный на:',
            login: 'В целях вашей безопасности мы отправили 6-значный код подтверждения на указанный ниже адрес электронной почты. Пожалуйста, проверьте входящие и введите код, чтобы подтвердить свою личность.'
        },
        verify_btn: 'ПОДТВЕРДИТЬ И АВТОРИЗОВАТЬ',
        verifying: 'ПРОВЕРКА...',
        resend_prompt: 'Не получили код на почту?',
        resend_btn: 'Отправить Код Повторно',
        resend_sending: 'Отправка...',
        resend_available_in: 'Повторная отправка через',
        cancel_btn: 'Отмена',
        close_title: 'Закрыть',
        success_verified: 'Код успешно подтвержден!',
        success_proceeding: 'Код успешно подтвержден! Переход...',
        err_6digits: 'Пожалуйста, введите все 6 цифр.',
        err_invalid: 'Неверный код. Пожалуйста, попробуйте снова.',
        err_expired: 'Ошибка проверки. Неверный или просроченный код.',
        err_generic: 'Ошибка проверки. Проверьте код и попробуйте снова.',
        err_dispatch: 'Ошибка отправки письма:'
    },
    ar: {
        titles: {
            device: 'تم اكتشاف متصفح جديد',
            payment: 'التحقق من بوابة الدفع',
            approval: 'تمت الموافقة على الحساب وهو جاهز',
            login: 'التحقق من البريد الإلكتروني'
        },
        descriptions: {
            device: 'من أجل أمانك، أرسلنا رمز تحقق مكون من 6 أرقام إلى عنوان بريدك الإلكتروني أدناه. يرجى التحقق من صندوق الوارد وإدخال الرمز لتأكيد هويتك.',
            payment: 'أنت تقوم بربط أو تحديث طريقة الدفع. أدخل رمز التفويض المكون من 6 أرقام المرسل إلى:',
            approval: 'تمت الموافقة على طلبك! أدخل رمز التفعيل المكون من 6 أرقام المرسل إلى:',
            login: 'من أجل أمانك، أرسلنا رمز تحقق مكون من 6 أرقام إلى عنوان بريدك الإلكتروني أدناه. يرجى التحقق من صندوق الوارد وإدخال الرمز لتأكيد هويتك.'
        },
        verify_btn: 'تحقق وتفويض',
        verifying: 'جاري التحقق...',
        resend_prompt: 'لم تستلم الرمز عبر البريد؟',
        resend_btn: 'إعادة إرسال الرمز',
        resend_sending: 'جاري الإرسال...',
        resend_available_in: 'إعادة الإرسال متاحة خلال',
        cancel_btn: 'إلغاء',
        close_title: 'إغلاق',
        success_verified: 'تم التحقق من الرمز بنجاح!',
        success_proceeding: 'تم التحقق من الرمز بنجاح! جاري المتابعة...',
        err_6digits: 'يرجى إدخال جميع الأرقام الستة.',
        err_invalid: 'رمز غير صالح. يرجى المحاولة مرة أخرى.',
        err_expired: 'فشل التحقق. الرمز غير صحيح أو منتهي الصلاحية.',
        err_generic: 'فشل التحقق. يرجى التأكد من الرمز والمحاولة مجدداً.',
        err_dispatch: 'خطأ في إرسال البريد الإلكتروني:'
    }
};

class OTPVerification {
    constructor() {
        this.modal = null;
        this.currentEmail = '';
        this.currentPurpose = 'login';
        this.currentLang = 'en';
        this.currentToken = null;
        this.onSuccess = null;
        this.onFailure = null;
        this.resendTimer = null;
        this.resendCountdown = 60;
        this.isVerifying = false;
        this.isSending = false;
        this.translations = otpTranslations;
    }

    // -------------------------------------------------------------
    // Language Detection Helper
    // Resolves from .goog-te-combo, googtrans cookie, localStorage,
    // document.documentElement.lang, or navigator.language
    // -------------------------------------------------------------
    detectLanguage() {
        try {
            // 1. Google Translate dropdown element value (.goog-te-combo)
            if (typeof document !== 'undefined') {
                const select = document.querySelector('.goog-te-combo');
                if (select && select.value) {
                    const code = select.value.toLowerCase().split('-')[0].trim();
                    if (this.translations[code]) return code;
                    if (select.value.toLowerCase().startsWith('zh')) return 'zh';
                }
            }

            // 2. googtrans cookie (/en/pt, /auto/es, etc.)
            if (typeof document !== 'undefined' && document.cookie) {
                const match = document.cookie.match(/googtrans=\/[^/]+\/([a-zA-Z\-]+)/);
                if (match && match[1]) {
                    const code = match[1].toLowerCase().split('-')[0].trim();
                    if (this.translations[code]) return code;
                    if (match[1].toLowerCase().startsWith('zh')) return 'zh';
                }
            }

            // 3. Check localStorage keys used across the site
            if (typeof localStorage !== 'undefined') {
                const keys = ['preferredLanguage', 'detected_language', 'site_language', 'selectedLanguage', 'language', 'lang'];
                for (const key of keys) {
                    const val = localStorage.getItem(key);
                    if (val && typeof val === 'string') {
                        const code = val.toLowerCase().split('-')[0].trim();
                        if (this.translations[code]) return code;
                        if (val.toLowerCase().startsWith('zh')) return 'zh';
                    }
                }
            }

            // 4. Check document.documentElement.lang
            if (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) {
                const docLang = document.documentElement.lang.toLowerCase().split('-')[0].trim();
                if (this.translations[docLang]) return docLang;
                if (document.documentElement.lang.toLowerCase().startsWith('zh')) return 'zh';
            }

            // 5. Browser navigator language fallback
            if (typeof navigator !== 'undefined') {
                const nav = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
                const code = nav.split('-')[0].trim();
                if (this.translations[code]) return code;
                if (nav.startsWith('zh')) return 'zh';
            }
        } catch (e) {
            console.warn('[OTPVerification] Language detection error:', e);
        }
        return 'en';
    }

    getT() {
        const lang = this.currentLang || this.detectLanguage();
        return this.translations[lang] || this.translations.en;
    }

    // -------------------------------------------------------------
    // Device & Browser Recognition
    // -------------------------------------------------------------
    getDeviceId() {
        try {
            let deviceId = localStorage.getItem('elite_device_id');
            if (!deviceId) {
                deviceId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
                localStorage.setItem('elite_device_id', deviceId);
            }
            return deviceId;
        } catch {
            return 'dev_unknown_browser';
        }
    }

    getStorageKey(email) {
        const clean = String(email || '').trim().toLowerCase();
        let hash = 'default';
        try {
            hash = btoa(clean).replace(/=/g, '');
        } catch {
            hash = clean.replace(/[^a-zA-Z0-9]/g, '_');
        }
        return `elite_recognized_device_${hash}`;
    }

    isDeviceRecognized(email) {
        if (!email) return false;
        try {
            const key = this.getStorageKey(email);
            const verified = localStorage.getItem(key);
            const devId = localStorage.getItem('elite_device_id');
            const verifiedDevId = localStorage.getItem(`${key}_id`);

            if (verified === 'true' && (!verifiedDevId || verifiedDevId === devId)) {
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    markDeviceRecognized(email) {
        if (!email) return;
        try {
            const key = this.getStorageKey(email);
            const devId = this.getDeviceId();
            localStorage.setItem(key, 'true');
            localStorage.setItem(`${key}_id`, devId);
            localStorage.setItem('elite_last_verified_at', new Date().toISOString());
        } catch (e) {
            console.warn('Failed to store device recognition:', e);
        }
    }

    clearDeviceRecognition(email) {
        if (!email) return;
        try {
            const key = this.getStorageKey(email);
            localStorage.removeItem(key);
            localStorage.removeItem(`${key}_id`);
        } catch (e) {
            console.warn('Failed to clear device recognition:', e);
        }
    }

    // -------------------------------------------------------------
    // Modal Initialization & Dynamic Rendering
    // -------------------------------------------------------------
    init() {
        this.currentLang = this.detectLanguage();

        if (document.getElementById('otp-modal')) {
            this.modal = document.getElementById('otp-modal');
            this.renderLocalizedContent();
            return;
        }

        const t = this.getT();

        const modalHTML = `
            <div id="otp-modal" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.92); z-index: 100000; align-items: center; justify-content: center; backdrop-filter: blur(8px); padding: 15px;">
                <div id="otp-modal-card" style="background: linear-gradient(135deg, #111827 0%, #080c14 100%); border: 2px solid #d4af37; border-radius: 16px; padding: 32px 28px; max-width: 460px; width: 100%; box-shadow: 0 0 50px rgba(212, 175, 55, 0.35); text-align: center; position: relative;">
                    
                    <button id="otp-close-x" type="button" style="position: absolute; top: 14px; right: 18px; background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; transition: color 0.2s;" title="${t.close_title}">&times;</button>

                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #d4af37, #FCD34D); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 0 25px rgba(212, 175, 55, 0.6);">
                        <i class="fas fa-shield-alt" style="color: #0F172A; font-size: 28px;"></i>
                    </div>

                    <h2 id="otp-title" style="color: #d4af37; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                        ${t.titles.login}
                    </h2>
                    
                    <p id="otp-subtitle" class="verification-subtitle" data-translate="verification_desc" style="color: #cbd5e1; font-size: 13.5px; line-height: 1.5; margin: 0 0 6px 0;">
                        ${t.descriptions.login}
                    </p>

                    <div id="otp-email-badge" style="display: inline-block; background: rgba(212, 175, 55, 0.12); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 20px; padding: 4px 14px; color: #facc15; font-size: 12.5px; font-weight: 600; margin-bottom: 20px; word-break: break-all; direction: ltr;">
                        user@example.com
                    </div>

                    <div id="otp-error" style="display: none; background: rgba(239, 68, 68, 0.15); border: 1px solid #EF4444; border-radius: 8px; padding: 10px 14px; margin-bottom: 18px; text-align: left;">
                        <p style="color: #fca5a5; font-size: 13px; margin: 0; line-height: 1.4;" id="otp-error-text"></p>
                    </div>

                    <div id="otp-success" style="display: none; background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; border-radius: 8px; padding: 10px 14px; margin-bottom: 18px;">
                        <p style="color: #6ee7b7; font-size: 13px; margin: 0; font-weight: 600;" id="otp-success-text">${t.success_verified}</p>
                    </div>

                    <!-- 6 Digit Input Group (Always LTR for clean input experience) -->
                    <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 22px; direction: ltr;">
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit" data-idx="0" style="width: 48px; height: 56px; background: #020617; border: 2px solid #475569; border-radius: 8px; color: #FCD34D; font-size: 26px; font-weight: 800; text-align: center; outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit" data-idx="1" style="width: 48px; height: 56px; background: #020617; border: 2px solid #475569; border-radius: 8px; color: #FCD34D; font-size: 26px; font-weight: 800; text-align: center; outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit" data-idx="2" style="width: 48px; height: 56px; background: #020617; border: 2px solid #475569; border-radius: 8px; color: #FCD34D; font-size: 26px; font-weight: 800; text-align: center; outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit" data-idx="3" style="width: 48px; height: 56px; background: #020617; border: 2px solid #475569; border-radius: 8px; color: #FCD34D; font-size: 26px; font-weight: 800; text-align: center; outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit" data-idx="4" style="width: 48px; height: 56px; background: #020617; border: 2px solid #475569; border-radius: 8px; color: #FCD34D; font-size: 26px; font-weight: 800; text-align: center; outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit" data-idx="5" style="width: 48px; height: 56px; background: #020617; border: 2px solid #475569; border-radius: 8px; color: #FCD34D; font-size: 26px; font-weight: 800; text-align: center; outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
                    </div>

                    <button id="otp-verify-btn" type="button" style="width: 100%; background: linear-gradient(135deg, #d4af37, #facc15); color: #020617; border: none; border-radius: 8px; padding: 14px; font-size: 15px; font-weight: 800; cursor: pointer; transition: transform 0.15s, box-shadow 0.2s; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 14px; box-shadow: 0 4px 18px rgba(212, 175, 55, 0.4);">
                        ${t.verify_btn}
                    </button>

                    <div style="text-align: center; margin-top: 10px;">
                        <span id="otp-resend-prompt" style="color: #64748b; font-size: 13px;">${t.resend_prompt} </span>
                        <button id="otp-resend-btn" type="button" style="background: none; border: none; color: #d4af37; font-weight: 700; font-size: 13px; cursor: pointer; text-decoration: underline; padding: 0 4px;">
                            ${t.resend_btn}
                        </button>
                        <span id="otp-resend-timer" style="display: none; color: #94a3b8; font-size: 13px;">
                            ${t.resend_available_in} <strong id="otp-countdown" style="color: #facc15;">60</strong>s
                        </span>
                    </div>

                    <div style="margin-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 14px;">
                        <button id="otp-cancel-btn" type="button" style="background: transparent; color: #94a3b8; border: none; font-size: 13px; cursor: pointer; padding: 6px 12px; transition: color 0.2s;">
                            ${t.cancel_btn}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('otp-modal');
        this.renderLocalizedContent();
        this.setupEventListeners();
    }

    renderLocalizedContent() {
        if (!this.modal) return;
        const t = this.getT();
        const purpose = this.currentPurpose;

        let purposeKey = 'login';
        if (purpose === 'payment') {
            purposeKey = 'payment';
        } else if (purpose === 'device' || purpose === 'browser') {
            purposeKey = 'device';
        } else if (purpose === 'approval') {
            purposeKey = 'approval';
        }

        const titleEl = document.getElementById('otp-title');
        const subEl = document.getElementById('otp-subtitle');
        const verifyBtn = document.getElementById('otp-verify-btn');
        const resendPrompt = document.getElementById('otp-resend-prompt');
        const resendBtn = document.getElementById('otp-resend-btn');
        const cancelBtn = document.getElementById('otp-cancel-btn');
        const closeX = document.getElementById('otp-close-x');
        const cardEl = document.getElementById('otp-modal-card');

        if (titleEl) titleEl.textContent = t.titles[purposeKey] || t.titles.login;
        if (subEl) subEl.textContent = t.descriptions[purposeKey] || t.descriptions.login;
        if (verifyBtn && !this.isVerifying) verifyBtn.textContent = t.verify_btn;
        if (resendPrompt) resendPrompt.textContent = t.resend_prompt + ' ';
        if (resendBtn && !this.isSending) resendBtn.textContent = t.resend_btn;
        if (cancelBtn) cancelBtn.textContent = t.cancel_btn;
        if (closeX) closeX.setAttribute('title', t.close_title || 'Close');

        if (cardEl) {
            if (this.currentLang === 'ar') {
                cardEl.setAttribute('dir', 'rtl');
            } else {
                cardEl.setAttribute('dir', 'ltr');
            }
        }
    }

    setupEventListeners() {
        const inputs = this.modal.querySelectorAll('.otp-digit');
        const verifyBtn = document.getElementById('otp-verify-btn');
        const resendBtn = document.getElementById('otp-resend-btn');
        const cancelBtn = document.getElementById('otp-cancel-btn');
        const closeX = document.getElementById('otp-close-x');

        inputs.forEach((input, index) => {
            input.addEventListener('focus', () => {
                input.style.borderColor = '#d4af37';
                input.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.5)';
                input.select();
            });

            input.addEventListener('blur', () => {
                input.style.borderColor = '#475569';
                input.style.boxShadow = 'none';
            });

            input.addEventListener('input', (e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = val ? val[val.length - 1] : '';

                if (e.target.value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }

                // If all 6 digits entered, auto-verify
                const fullCode = Array.from(inputs).map(i => i.value).join('');
                if (fullCode.length === 6) {
                    setTimeout(() => this.verifyCode(), 100);
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                } else if (e.key === 'ArrowLeft' && index > 0) {
                    inputs[index - 1].focus();
                } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                } else if (e.key === 'Enter') {
                    this.verifyCode();
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
                const digits = paste.replace(/[^0-9]/g, '').slice(0, 6);
                if (digits) {
                    digits.split('').forEach((d, i) => {
                        if (inputs[i]) inputs[i].value = d;
                    });
                    const targetIndex = Math.min(digits.length, 5);
                    inputs[targetIndex].focus();

                    if (digits.length === 6) {
                        setTimeout(() => this.verifyCode(), 150);
                    }
                }
            });
        });

        if (verifyBtn) verifyBtn.addEventListener('click', () => this.verifyCode());
        if (resendBtn) resendBtn.addEventListener('click', () => this.resendCode());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.handleCancel());
        if (closeX) closeX.addEventListener('click', () => this.handleCancel());
    }

    // -------------------------------------------------------------
    // Display Modal & Configure Text
    // -------------------------------------------------------------
    show(email, purpose = 'login', onSuccess = null, onFailure = null, explicitLanguage = null) {
        this.init();
        this.currentEmail = String(email || '').trim().toLowerCase();
        this.currentPurpose = purpose;
        this.onSuccess = onSuccess;
        this.onFailure = onFailure;
        this.currentToken = null;

        // Automatically detect active site language or apply override
        if (explicitLanguage && this.translations[explicitLanguage]) {
            this.currentLang = explicitLanguage;
        } else {
            this.currentLang = this.detectLanguage();
        }

        this.renderLocalizedContent();

        const badgeEl = document.getElementById('otp-email-badge');
        if (badgeEl) badgeEl.textContent = this.currentEmail || 'your email';

        // Clear previous state
        this.resetInputs();
        this.hideMessages();

        // Send code via Brevo API with detected language
        this.sendCode();

        // Show modal
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            const first = this.modal.querySelector('.otp-digit');
            if (first) first.focus();
        }, 150);
    }

    verifyAsync(email, purpose = 'login', explicitLanguage = null) {
        return new Promise((resolve, reject) => {
            this.show(
                email,
                purpose,
                () => resolve(true),
                (err) => reject(err || new Error('Verification cancelled')),
                explicitLanguage
            );
        });
    }

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (this.resendTimer) {
            clearInterval(this.resendTimer);
            this.resendTimer = null;
        }
    }

    handleCancel() {
        this.hide();
        if (typeof this.onFailure === 'function') {
            this.onFailure(new Error('User cancelled verification'));
        }
    }

    resetInputs() {
        if (!this.modal) return;
        const inputs = this.modal.querySelectorAll('.otp-digit');
        inputs.forEach(i => {
            i.value = '';
            i.style.borderColor = '#475569';
        });
    }

    hideMessages() {
        const err = document.getElementById('otp-error');
        const succ = document.getElementById('otp-success');
        if (err) err.style.display = 'none';
        if (succ) succ.style.display = 'none';
    }

    showError(msg) {
        const err = document.getElementById('otp-error');
        const errText = document.getElementById('otp-error-text');
        const succ = document.getElementById('otp-success');
        const t = this.getT();

        if (succ) succ.style.display = 'none';
        if (errText) errText.textContent = msg || t.err_invalid;
        if (err) err.style.display = 'block';

        if (this.modal) {
            const inputs = this.modal.querySelectorAll('.otp-digit');
            inputs.forEach(i => {
                i.style.borderColor = '#EF4444';
            });
            setTimeout(() => {
                inputs.forEach(i => { i.style.borderColor = '#475569'; });
            }, 1200);
        }
    }

    showSuccess(msg) {
        const err = document.getElementById('otp-error');
        const succ = document.getElementById('otp-success');
        const succText = document.getElementById('otp-success-text');
        const t = this.getT();

        if (err) err.style.display = 'none';
        if (succText) succText.textContent = msg || t.success_verified;
        if (succ) succ.style.display = 'block';
    }

    // -------------------------------------------------------------
    // API Dispatch (Brevo API backend function with active language)
    // -------------------------------------------------------------
    async sendCode() {
        if (this.isSending) return;
        this.isSending = true;
        this.hideMessages();

        // Refresh detected language in case it changed on the page
        this.currentLang = this.detectLanguage();
        this.renderLocalizedContent();
        const t = this.getT();

        try {
            // Attempt primary Netlify function send-verification-email with language parameter
            let response = await fetch('/.netlify/functions/send-verification-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'send',
                    email: this.currentEmail,
                    purpose: this.currentPurpose,
                    language: this.currentLang
                })
            });

            // Fallback to send-otp if function name differs
            if (response.status === 404) {
                response = await fetch('/.netlify/functions/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: this.currentEmail,
                        purpose: this.currentPurpose,
                        language: this.currentLang
                    })
                });
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error('Verification email API error response:', {
                    status: response.status,
                    body: data
                });
                throw new Error(data.error || 'Failed to dispatch verification code email');
            }

            if (data.token) {
                this.currentToken = data.token;
            }

            this.startResendTimer();
        } catch (error) {
            console.error('Error sending verification code:', error);
            this.showError(`${t.err_dispatch} ${error.message || 'Please check BREVO_API_KEY configuration.'}`);
        } finally {
            this.isSending = false;
        }
    }

    async resendCode() {
        const resendBtn = document.getElementById('otp-resend-btn');
        const t = this.getT();

        if (resendBtn) {
            resendBtn.disabled = true;
            resendBtn.textContent = t.resend_sending;
        }

        await this.sendCode();

        if (resendBtn) {
            resendBtn.disabled = false;
            resendBtn.textContent = t.resend_btn;
        }
    }

    startResendTimer() {
        this.resendCountdown = 60;
        const resendBtn = document.getElementById('otp-resend-btn');
        const timerContainer = document.getElementById('otp-resend-timer');
        const t = this.getT();

        if (resendBtn) resendBtn.style.display = 'none';
        if (timerContainer) {
            timerContainer.style.display = 'inline';
            timerContainer.innerHTML = `${t.resend_available_in} <strong id="otp-countdown" style="color: #facc15;">${this.resendCountdown}</strong>s`;
        }

        if (this.resendTimer) clearInterval(this.resendTimer);

        this.resendTimer = setInterval(() => {
            this.resendCountdown--;
            const countdownEl = document.getElementById('otp-countdown');
            if (countdownEl) countdownEl.textContent = this.resendCountdown;

            if (this.resendCountdown <= 0) {
                clearInterval(this.resendTimer);
                this.resendTimer = null;
                if (resendBtn) {
                    resendBtn.style.display = 'inline';
                    resendBtn.disabled = false;
                    resendBtn.textContent = t.resend_btn;
                }
                if (timerContainer) timerContainer.style.display = 'none';
            }
        }, 1000);
    }

    // -------------------------------------------------------------
    // Code Verification
    // -------------------------------------------------------------
    async verifyCode() {
        if (this.isVerifying) return;
        const inputs = this.modal.querySelectorAll('.otp-digit');
        const code = Array.from(inputs).map(i => i.value).join('');
        const t = this.getT();

        if (code.length !== 6) {
            this.showError(t.err_6digits);
            return;
        }

        const verifyBtn = document.getElementById('otp-verify-btn');
        this.isVerifying = true;
        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t.verifying}`;
        }

        try {
            // Attempt send-verification-email verify action
            let response = await fetch('/.netlify/functions/send-verification-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify',
                    email: this.currentEmail,
                    code: code,
                    purpose: this.currentPurpose,
                    token: this.currentToken,
                    language: this.currentLang
                })
            });

            // Fallback to verify-otp if 404
            if (response.status === 404) {
                response = await fetch('/.netlify/functions/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: this.currentEmail,
                        code: code,
                        purpose: this.currentPurpose,
                        token: this.currentToken,
                        language: this.currentLang
                    })
                });
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.success) {
                if (!response.ok) {
                    console.error('Verification API error response:', {
                        status: response.status,
                        body: data
                    });
                }
                throw new Error(data.error || t.err_expired);
            }

            // Mark device as recognized for device/browser/login/approval purposes
            if (this.currentPurpose === 'device' || this.currentPurpose === 'browser' || this.currentPurpose === 'approval' || this.currentPurpose === 'login') {
                this.markDeviceRecognized(this.currentEmail);
            }

            this.showSuccess(t.success_proceeding);

            setTimeout(() => {
                this.hide();
                if (typeof this.onSuccess === 'function') {
                    this.onSuccess(data);
                }
            }, 800);

        } catch (error) {
            console.error('Verification error:', error);
            this.showError(error.message || t.err_generic);
            if (typeof this.onFailure === 'function') {
                this.onFailure(error);
            }
        } finally {
            this.isVerifying = false;
            if (verifyBtn) {
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = t.verify_btn;
            }
        }
    }
}

// Global Singleton Instance & Exports
window.otpTranslations = otpTranslations;
window.OTPVerification = new OTPVerification();
