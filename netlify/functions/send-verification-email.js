const crypto = require('crypto');

// In-memory backup store with TTL for the same container session
const otpMemoryStore = new Map();

function getSecretKey() {
    return process.env.BREVO_API_KEY || process.env.JWT_SECRET || 'illuminati_portal_secure_otp_salt_2026';
}

function generateHMAC(email, purpose, code, timestamp) {
    const secret = getSecretKey();
    const data = `${String(email).trim().toLowerCase()}:${purpose || 'login'}:${String(code).trim()}:${timestamp}`;
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function generate6DigitCode() {
    return crypto.randomInt(100000, 999999).toString();
}

function storeInMemory(email, code, purpose) {
    const key = `${String(email).trim().toLowerCase()}_${purpose || 'login'}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpMemoryStore.set(key, { code, expiresAt, attempts: 0 });

    if (otpMemoryStore.size > 2000) {
        const now = Date.now();
        for (const [k, val] of otpMemoryStore.entries()) {
            if (val.expiresAt < now) otpMemoryStore.delete(k);
        }
    }
}

function verifyInMemory(email, code, purpose) {
    const key = `${String(email).trim().toLowerCase()}_${purpose || 'login'}`;
    const stored = otpMemoryStore.get(key);
    if (!stored) return false;
    if (stored.expiresAt < Date.now()) {
        otpMemoryStore.delete(key);
        return false;
    }
    if (stored.code === String(code).trim()) {
        otpMemoryStore.delete(key);
        return true;
    }
    stored.attempts = (stored.attempts || 0) + 1;
    if (stored.attempts >= 4) {
        otpMemoryStore.delete(key);
    }
    return false;
}

// =========================================================================
// MULTILINGUAL EMAIL DICTIONARY (13 LANGUAGES)
// English (en), Portuguese (pt), Spanish (es), French (fr), German (de),
// Italian (it), Japanese (ja), Chinese (zh), Dutch (nl), Serbian (sr),
// Turkish (tr), Russian (ru), Arabic (ar)
// =========================================================================
const emailDictionary = {
    en: {
        headerSubtitle: 'Elite Account Security Verification',
        validityHtml: 'This one-time passcode is valid for <strong>10 minutes</strong>.',
        validityText: 'This code will expire in 10 minutes.',
        securityNoticeHtml: '<strong>SECURITY NOTICE:</strong> If you did not initiate this request or access your Elite account, please contact the Secretary General immediately.',
        securityNoticeText: 'SECURITY NOTICE: If you did not initiate this request or access your Elite account, please contact the Secretary General immediately.',
        footer: '&copy; 2026 Illuminati Global Oversight. All rights reserved. Confidential transmission.',
        textCodePrefix: 'YOUR 6-DIGIT VERIFICATION CODE:',
        textIgnoreNotice: 'If you did not request this code, please contact support or ignore this message.',
        purposes: {
            login: {
                subject: 'Illuminati Portal - Security Verification Code',
                headline: 'Security Verification',
                description: 'Enter this 6-digit code to authorize access to your Elite Account.'
            },
            device: {
                subject: 'Illuminati Portal - Unrecognized Browser Verification',
                headline: 'New Browser Detected',
                description: 'A login or access attempt was detected from an unrecognized browser or device. Enter the 6-digit authorization code below to verify your identity:'
            },
            payment: {
                subject: 'Illuminati Portal - Payment Method Security Verification',
                headline: 'Payout Gateway Verification',
                description: 'You are linking or updating a payout gateway channel (such as CashApp, Venmo, or Bank Transfer) on the Global Ledger. Please confirm this change with the 6-digit code below:'
            },
            approval: {
                subject: 'Illuminati Portal - Membership Approved & Account Access Code',
                headline: 'Account Approved - Welcome',
                description: 'Your membership has been officially approved by the Secretary General. To unlock and enter your Elite Dashboard, please enter your 6-digit authorization code below:'
            }
        }
    },
    pt: {
        headerSubtitle: 'Verificação de Segurança da Conta Elite',
        validityHtml: 'Este código de utilização única é válido por <strong>10 minutos</strong>.',
        validityText: 'Este código expira em 10 minutos.',
        securityNoticeHtml: '<strong>AVISO DE SEGURANÇA:</strong> Se não iniciou este pedido nem acedeu à sua conta Elite, contacte o Secretário-Geral imediatamente.',
        securityNoticeText: 'AVISO DE SEGURANÇA: Se não iniciou este pedido nem acedeu à sua conta Elite, contacte o Secretário-Geral imediatamente.',
        footer: '&copy; 2026 Illuminati Global Oversight. Todos os direitos reservados. Transmissão confidencial.',
        textCodePrefix: 'O SEU CÓDIGO DE VERIFICAÇÃO DE 6 DÍGITOS:',
        textIgnoreNotice: 'Se não solicitou este código, contacte o suporte ou ignore esta mensagem.',
        purposes: {
            login: {
                subject: 'Portal Illuminati - Código de Verificação de Segurança',
                headline: 'Verificação de Segurança',
                description: 'Introduza este código de 6 dígitos para autorizar o acesso à sua Conta Elite.'
            },
            device: {
                subject: 'Portal Illuminati - Verificação de Novo Navegador',
                headline: 'Novo Navegador Detetado',
                description: 'Foi detetada uma tentativa de acesso a partir de um navegador ou dispositivo não reconhecido. Introduza o código de autorização de 6 dígitos abaixo para verificar a sua identidade:'
            },
            payment: {
                subject: 'Portal Illuminati - Verificação de Método de Pagamento',
                headline: 'Verificação da Carteira de Pagamento',
                description: 'Está a vincular ou atualizar um canal de pagamento no Livro-Razão Global. Confirme esta alteração com o código de 6 dígitos abaixo:'
            },
            approval: {
                subject: 'Portal Illuminati - Filiação Aprovada e Código de Acesso',
                headline: 'Conta Aprovada - Bem-vindo',
                description: 'A sua filiação foi oficialmente aprovada pelo Secretário-Geral. Para desbloquear e entrar no seu Painel Elite, introduza o código de autorização de 6 dígitos abaixo:'
            }
        }
    },
    es: {
        headerSubtitle: 'Verificación de Seguridad de Cuenta Elite',
        validityHtml: 'Este código de un solo uso es válido por <strong>10 minutos</strong>.',
        validityText: 'Este código caducará en 10 minutos.',
        securityNoticeHtml: '<strong>AVISO DE SEGURIDAD:</strong> Si no inició esta solicitud ni accedió a su cuenta Elite, comuníquese con el Secretario General de inmediato.',
        securityNoticeText: 'AVISO DE SEGURIDAD: Si no inició esta solicitud ni accedió a su cuenta Elite, comuníquese con el Secretario General de inmediato.',
        footer: '&copy; 2026 Illuminati Global Oversight. Todos los derechos reservados. Transmisión confidencial.',
        textCodePrefix: 'SU CÓDIGO DE VERIFICACIÓN DE 6 DÍGITOS:',
        textIgnoreNotice: 'Si no solicitó este código, comuníquese con el soporte técnico o ignore este mensaje.',
        purposes: {
            login: {
                subject: 'Portal Illuminati - Código de Verificación de Seguridad',
                headline: 'Verificación de Seguridad',
                description: 'Ingrese este código de 6 dígitos para autorizar el acceso a su Cuenta Elite.'
            },
            device: {
                subject: 'Portal Illuminati - Verificación de Navegador No Reconocido',
                headline: 'Nuevo Navegador Detectado',
                description: 'Se detectó un intento de inicio de sesión o acceso desde un navegador o dispositivo no reconocido. Ingrese el código de autorización de 6 dígitos a continuación para verificar su identidad:'
            },
            payment: {
                subject: 'Portal Illuminati - Verificación de Seguridad de Método de Pago',
                headline: 'Verificación de Pasarela de Pago',
                description: 'Está vinculando o actualizando un canal de pasarela de pago en el Libro Mayor Global. Por favor confirme este cambio con el código de 6 dígitos a continuación:'
            },
            approval: {
                subject: 'Portal Illuminati - Membresía Aprobada y Código de Acceso',
                headline: 'Cuenta Aprobada - Bienvenido',
                description: 'Su membresía ha sido aprobada oficialmente por el Secretario General. Para desbloquear e ingresar a su Panel Elite, ingrese su código de autorización de 6 dígitos a continuación:'
            }
        }
    },
    fr: {
        headerSubtitle: 'Vérification de Sécurité du Compte Elite',
        validityHtml: 'Ce code à usage unique est valable pendant <strong>10 minutes</strong>.',
        validityText: 'Ce code expirera dans 10 minutes.',
        securityNoticeHtml: '<strong>AVIS DE SÉCURITÉ :</strong> Si vous n\'êtes pas à l\'origine de cette demande ou si vous n\'avez pas accédé à votre compte Elite, veuillez contacter immédiatement le Secrétaire Général.',
        securityNoticeText: 'AVIS DE SÉCURITÉ : Si vous n\'êtes pas à l\'origine de cette demande ou si vous n\'avez pas accédé à votre compte Elite, veuillez contacter immédiatement le Secrétaire Général.',
        footer: '&copy; 2026 Illuminati Global Oversight. Tous droits réservés. Transmission confidentielle.',
        textCodePrefix: 'VOTRE CODE DE VÉRIFICATION À 6 CHIFFRES :',
        textIgnoreNotice: 'Si vous n\'avez pas demandé ce code, veuillez contacter l\'assistance ou ignorer ce message.',
        purposes: {
            login: {
                subject: 'Portail Illuminati - Code de Vérification de Sécurité',
                headline: 'Vérification de Sécurité',
                description: 'Entrez ce code à 6 chiffres pour autoriser l\'accès à votre Compte Elite.'
            },
            device: {
                subject: 'Portail Illuminati - Vérification de Navigateur Non Reconnu',
                headline: 'Nouveau Navigateur Détecté',
                description: 'Une tentative de connexion ou d\'accès a été détectée depuis un navigateur ou un appareil non reconnu. Entrez le code d\'autorisation à 6 chiffres ci-dessous pour vérifier votre identité :'
            },
            payment: {
                subject: 'Portail Illuminati - Vérification du Mode de Paiement',
                headline: 'Vérification de la Passerelle de Paiement',
                description: 'Vous liez ou mettez à jour un canal de passerelle de paiement sur le Grand Livre Global. Veuillez confirmer ce changement avec le code à 6 chiffres ci-dessous :'
            },
            approval: {
                subject: 'Portail Illuminati - Adhésion Approuvée et Code d\'Accès',
                headline: 'Compte Approuvé - Bienvenue',
                description: 'Votre adhésion a été officiellement approuvée par le Secrétaire Général. Pour déverrouiller et accéder à votre Tableau de Bord Elite, veuillez entrer votre code d\'autorisation à 6 chiffres ci-dessous :'
            }
        }
    },
    de: {
        headerSubtitle: 'Sicherheitsüberprüfung des Elite-Kontos',
        validityHtml: 'Dieser Einmal-Passcode ist für <strong>10 Minuten</strong> gültig.',
        validityText: 'Dieser Code läuft in 10 Minuten ab.',
        securityNoticeHtml: '<strong>SICHERHEITSHINWEIS:</strong> Wenn Sie diese Anfrage nicht initiiert haben oder nicht auf Ihr Elite-Konto zugegriffen haben, wenden Sie sich bitte umgehend an den Generalsekretär.',
        securityNoticeText: 'SICHERHEITSHINWEIS: Wenn Sie diese Anfrage nicht initiiert haben, wenden Sie sich bitte umgehend an den Generalsekretär.',
        footer: '&copy; 2026 Illuminati Global Oversight. Alle Rechte vorbehalten. Vertrauliche Übertragung.',
        textCodePrefix: 'IHR 6-STELLIGER VERIFIZIERUNGSCODE:',
        textIgnoreNotice: 'Wenn Sie diesen Code nicht angefordert haben, ignorieren Sie diese Nachricht oder kontaktieren Sie den Support.',
        purposes: {
            login: {
                subject: 'Illuminati Portal - Sicherheits-Verifizierungscode',
                headline: 'Sicherheitsüberprüfung',
                description: 'Geben Sie diesen 6-stelligen Code ein, um den Zugriff auf Ihr Elite-Konto zu autorisieren.'
            },
            device: {
                subject: 'Illuminati Portal - Überprüfung eines unbekannten Browsers',
                headline: 'Neuer Browser Erkannt',
                description: 'Ein Anmeldeversuch wurde von einem nicht erkannten Browser oder Gerät festgestellt. Geben Sie den folgenden 6-stelligen Autorisierungscode ein, um Ihre Identität zu bestätigen:'
            },
            payment: {
                subject: 'Illuminati Portal - Zahlungsmethode Sicherheitsüberprüfung',
                headline: 'Verifizierung des Zahlungs-Gateways',
                description: 'Sie verknüpfen oder aktualisieren einen Auszahlungskanal im Global Ledger. Bitte bestätigen Sie diese Änderung mit dem untenstehenden 6-stelligen Code:'
            },
            approval: {
                subject: 'Illuminati Portal - Mitgliedschaft Genehmigt & Zugangscode',
                headline: 'Konto Bestätigt - Willkommen',
                description: 'Ihre Mitgliedschaft wurde vom Generalsekretär offiziell genehmigt. Um Ihr Elite-Dashboard freizuschalten, geben Sie bitte Ihren 6-stelligen Autorisierungscode ein:'
            }
        }
    },
    it: {
        headerSubtitle: 'Verifica di Sicurezza dell\'Account Elite',
        validityHtml: 'Questo passcode monouso è valido per <strong>10 minuti</strong>.',
        validityText: 'Questo codice scadrà tra 10 minuti.',
        securityNoticeHtml: '<strong>AVVISO DI SICUREZZA:</strong> Se non hai avviato questa richiesta o non hai effettuato l\'accesso al tuo account Elite, contatta immediatamente il Segretario Generale.',
        securityNoticeText: 'AVVISO DI SICUREZZA: Se non hai avviato questa richiesta, contatta immediatamente il Segretario Generale.',
        footer: '&copy; 2026 Illuminati Global Oversight. Tutti i diritti riservati. Trasmissione riservata.',
        textCodePrefix: 'IL TUO CODICE DI VERIFICA A 6 CIFRE:',
        textIgnoreNotice: 'Se non hai richiesto questo codice, contatta l\'assistenza o ignora questo messaggio.',
        purposes: {
            login: {
                subject: 'Portale Illuminati - Codice di Verifica della Sicurezza',
                headline: 'Verifica di Sicurezza',
                description: 'Inserisci questo codice a 6 cifre per autorizzare l\'accesso al tuo Account Elite.'
            },
            device: {
                subject: 'Portale Illuminati - Verifica Browser Non Riconosciuto',
                headline: 'Nuovo Browser Rilevato',
                description: 'È stato rilevato un tentativo di accesso da un browser o dispositivo non riconosciuto. Inserisci il codice di autorizzazione a 6 cifre sottostante per verificare la tua identità:'
            },
            payment: {
                subject: 'Portale Illuminati - Verifica di Sicurezza del Metodo di Pagamento',
                headline: 'Verifica Gateway di Pagamento',
                description: 'Stai collegando o aggiornando un canale di pagamento sul Libro Mastro Globale. Conferma questa modifica con il codice a 6 cifre qui sotto:'
            },
            approval: {
                subject: 'Portale Illuminati - Iscrizione Approvata e Codice di Accesso',
                headline: 'Account Approvato - Benvenuto',
                description: 'La tua adesione è stata ufficialmente approvata dal Segretario Generale. Per sbloccare ed entrare nella tua Dashboard Elite, inserisci il tuo codice di autorizzazione a 6 cifre:'
            }
        }
    },
    ja: {
        headerSubtitle: 'エリートアカウントセキュリティ認証',
        validityHtml: 'このワンタイム認証コードの有効期限は<strong>10分間</strong>です。',
        validityText: 'このコードは10分で期限切れになります。',
        securityNoticeHtml: '<strong>セキュリティ通知：</strong> このリクエストを開始していない場合、またはエリートアカウントにアクセスしていない場合は、直ちに事務総長までご連絡ください。',
        securityNoticeText: 'セキュリティ通知：このリクエストを開始していない場合、直ちに事務総長までご連絡ください。',
        footer: '&copy; 2026 Illuminati Global Oversight. 無断転載を禁じます。機密通信。',
        textCodePrefix: 'お客様の6桁の認証コード：',
        textIgnoreNotice: 'このコードをリクエストしていない場合は、サポートにお問い合わせいただくか、このメッセージを無視してください。',
        purposes: {
            login: {
                subject: 'イルミナティポータル - セキュリティ認証コード',
                headline: 'セキュリティ認証',
                description: 'エリートアカウントへのアクセスを承認するには、この6桁のコードを入力してください。'
            },
            device: {
                subject: 'イルミナティポータル - 未認識ブラウザの確認',
                headline: '新しいブラウザが検出されました',
                description: '認識されていないブラウザまたはデバイスからのアクセス試行が検出されました。本人確認のため、以下の6桁の認証コードを入力してください：'
            },
            payment: {
                subject: 'イルミナティポータル - 支払い方法のセキュリティ確認',
                headline: '決済ゲートウェイの確認',
                description: 'グローバル元帳で出金ゲートウェイチャネルを連携または更新しています。以下の6桁のコードでこの変更を確認してください：'
            },
            approval: {
                subject: 'イルミナティポータル - 会員承認およびアカウントアクセスコード',
                headline: 'アカウント承認完了 - ようこそ',
                description: 'あなたの会員権は事務総長によって正式に承認されました。エリートダッシュボードのロックを解除して入場するには、以下の6桁の認証コードを入力してください：'
            }
        }
    },
    zh: {
        headerSubtitle: '精英账户安全验证',
        validityHtml: '此一次性验证码的有效期为 <strong>10 分钟</strong>。',
        validityText: '此验证码将在10分钟内失效。',
        securityNoticeHtml: '<strong>安全警示：</strong> 如果您并未发起此请求或访问您的精英账户，请立即联系秘书长。',
        securityNoticeText: '安全警示：如果您并未发起此请求，请立即联系秘书长。',
        footer: '&copy; 2026 Illuminati Global Oversight. 版权所有。机密传输。',
        textCodePrefix: '您的6位数安全验证码：',
        textIgnoreNotice: '如果您未曾请求此验证码，请联系客服或忽略此信息。',
        purposes: {
            login: {
                subject: '光明会门户 - 安全验证码',
                headline: '安全验证',
                description: '请输入此6位数验证码以授权访问您的精英账户。'
            },
            device: {
                subject: '光明会门户 - 未识别浏览器验证',
                headline: '检测到新浏览器',
                description: '系统检测到来自未识别浏览器或设备的新登录请求。请输入以下6位数授权码以验证您的身份：'
            },
            payment: {
                subject: '光明会门户 - 支付方式安全验证',
                headline: '支付网关验证',
                description: '您正在全局账本上绑定或更新提现网关渠道。请使用下方的6位数验证码确认此更改：'
            },
            approval: {
                subject: '光明会门户 - 会员资格已批准及账户访问码',
                headline: '账户已批准 - 欢迎加入',
                description: '您的会员资格已获秘书长正式批准。要解锁并进入您的精英仪表盘，请在下方输入您的6位数授权码：'
            }
        }
    },
    nl: {
        headerSubtitle: 'Elite Account Beveiligingsverificatie',
        validityHtml: 'Deze eenmalige toegangscode is <strong>10 minuten</strong> geldig.',
        validityText: 'Deze code verloopt over 10 minuten.',
        securityNoticeHtml: '<strong>VEILIGHEIDSKENNISGEVING:</strong> Als u dit verzoek niet heeft gedaan of geen toegang heeft gezocht tot uw Elite-account, neem dan onmiddellijk contact op met de Secretaris-Generaal.',
        securityNoticeText: 'VEILIGHEIDSKENNISGEVING: Als u dit verzoek niet heeft gedaan, neem dan onmiddellijk contact op met de Secretaris-Generaal.',
        footer: '&copy; 2026 Illuminati Global Oversight. Alle rechten voorbehouden. Vertrouwelijke verzending.',
        textCodePrefix: 'UW 6-CIJFERIGE VERIFICATIECODE:',
        textIgnoreNotice: 'Als u deze code niet heeft aangevraagd, neem dan contact op met support of negeer dit bericht.',
        purposes: {
            login: {
                subject: 'Illuminati Portaal - Beveiligingsverificatiecode',
                headline: 'Beveiligingsverificatie',
                description: 'Voer deze 6-cijferige code in om toegang tot uw Elite-account te autoriseren.'
            },
            device: {
                subject: 'Illuminati Portaal - Verificatie Niet-herkende Browser',
                headline: 'Nieuwe Browser Gedetecteerd',
                description: 'Er is een inlog- of toegangspoging gedetecteerd vanaf een niet-herkende browser of apparaat. Voer de onderstaande 6-cijferige autorisatiecode in om uw identiteit te verifiëren:'
            },
            payment: {
                subject: 'Illuminati Portaal - Beveiligingsverificatie Betaalmethode',
                headline: 'Verificatie Betalingsgateway',
                description: 'U koppelt of wijzigt een uitbetalingsgateway op het Global Ledger. Bevestig deze wijziging met de onderstaande 6-cijferige code:'
            },
            approval: {
                subject: 'Illuminati Portaal - Lidmaatschap Goedgekeurd & Toegangscode',
                headline: 'Account Goedgekeurd - Welkom',
                description: 'Uw lidmaatschap is officieel goedgekeurd door de Secretaris-Generaal. Voer uw 6-cijferige autorisatiecode in om uw Elite Dashboard te ontgrendelen:'
            }
        }
    },
    sr: {
        headerSubtitle: 'Сигурносна Верификација Елитног Налога',
        validityHtml: 'Ова једнократна лозинка важи <strong>10 минута</strong>.',
        validityText: 'Овај код истиче за 10 минута.',
        securityNoticeHtml: '<strong>БЕЗБЕДНОСНО ОБАВЕШТЕЊЕ:</strong> Ако нисте покренули овај захтев нити приступали свом Елитном налогу, одмах контактирајте Генералног Секретара.',
        securityNoticeText: 'БЕЗБЕДНОСНО ОБАВЕШТЕЊЕ: Ако нисте покренули овај захтев, одмах контактирајте Генералног Секретара.',
        footer: '&copy; 2026 Illuminati Global Oversight. Сва права задржана. Поверљив пренос.',
        textCodePrefix: 'ВАШ 6-ЦИФРЕНИ ВЕРИФИКАЦИОНИ КОД:',
        textIgnoreNotice: 'Ако нисте затражили овај код, обратите се подршци или занемарите ову поруку.',
        purposes: {
            login: {
                subject: 'Илуминати Портал - Сигурносни Верификациони Код',
                headline: 'Сигурносна Верификација',
                description: 'Унесите овај шестоцифрени код да бисте одобрили приступ свом Елитном налогу.'
            },
            device: {
                subject: 'Илуминати Портал - Верификација Непрепознатог Прегледача',
                headline: 'Откривен Нови Прегледач',
                description: 'Откривен је покушај пријављивања или приступа са непрепознатог прегледача или уређаја. Унесите шестоцифрени ауторизациони код испод да бисте верификовали свој идентитет:'
            },
            payment: {
                subject: 'Илуминати Портал - Сигурносна Верификација Начина Плаћања',
                headline: 'Верификација Гатеваи-а за Плаћање',
                description: 'Повезујете или ажурирате канал исплате на Глобалној књизи. Молимо потврдите ову промену са шестоцифреним кодом испод:'
            },
            approval: {
                subject: 'Илуминати Портал - Чланство Одобрено и Код за Приступ',
                headline: 'Налог Одобрен - Добродошли',
                description: 'Ваше чланство је званично одобрио Генерални Секретар. Да бисте откључали и ушли на своју Елитну контролну таблу, унесите свој шестоцифрени код испод:'
            }
        }
    },
    tr: {
        headerSubtitle: 'Elite Hesap Güvenlik Doğrulaması',
        validityHtml: 'Bu tek kullanımlık şifre <strong>10 dakika</strong> geçerlidir.',
        validityText: 'Bu kodun süresi 10 dakika içinde dolacaktır.',
        securityNoticeHtml: '<strong>GÜVENLİK BİLDİRİMİ:</strong> Bu isteği siz başlatmadıysanız veya Elite hesabınıza erişmediyseniz, lütfen derhal Genel Sekreter ile iletişime geçin.',
        securityNoticeText: 'GÜVENLİK BİLDİRİMİ: Bu isteği siz başlatmadıysanız, lütfen derhal Genel Sekreter ile iletişime geçin.',
        footer: '&copy; 2026 Illuminati Global Oversight. Tüm hakları saklıdır. Gizli iletim.',
        textCodePrefix: '6 HANELİ DOĞRULAMA KODUNUZ:',
        textIgnoreNotice: 'Bu kodu siz talep etmediyseniz, destekle iletişime geçin veya bu mesajı dikkate almayın.',
        purposes: {
            login: {
                subject: 'Illuminati Portalı - Güvenlik Doğrulama Kodu',
                headline: 'Güvenlik Doğrulaması',
                description: 'Elite Hesabınıza erişimi yetkilendirmek için bu 6 haneli kodu girin.'
            },
            device: {
                subject: 'Illuminati Portalı - Tanınmayan Tarayıcı Doğrulaması',
                headline: 'Yeni Tarayıcı Algılandı',
                description: 'Tanınmayan bir tarayıcıdan veya cihazdan oturum açma veya erişim girişimi algılandı. Kimliğinizi doğrulamak için aşağıdaki 6 haneli yetkilendirme kodunu girin:'
            },
            payment: {
                subject: 'Illuminati Portalı - Ödeme Yöntemi Güvenlik Doğrulaması',
                headline: 'Ödeme Ağ Geçidi Doğrulaması',
                description: 'Küresel Defterde bir ödeme ağ geçidi kanalını bağlıyor veya güncelliyorsunuz. Lütfen bu değişikliği aşağıdaki 6 haneli kodla onaylayın:'
            },
            approval: {
                subject: 'Illuminati Portalı - Üyelik Onaylandı ve Hesap Erişim Kodu',
                headline: 'Hesap Onaylandı - Hoş Geldiniz',
                description: 'Üyeliğiniz Genel Sekreter tarafından resmen onaylanmıştır. Elite Panonuza erişmek ve kilidi açmak için lütfen aşağıdaki 6 haneli kodunuzu girin:'
            }
        }
    },
    ru: {
        headerSubtitle: 'Проверка Безопасности Аккаунта Elite',
        validityHtml: 'Этот одноразовый пароль действителен в течение <strong>10 минут</strong>.',
        validityText: 'Срок действия этого кода истекает через 10 минут.',
        securityNoticeHtml: '<strong>УВЕДОМЛЕНИЕ О БЕЗОПАСНОСТИ:</strong> Если вы не инициировали этот запрос и не входили в свой аккаунт Elite, немедленно свяжитесь с Генеральным секретарем.',
        securityNoticeText: 'УВЕДОМЛЕНИЕ О БЕЗОПАСНОСТИ: Если вы не инициировали этот запрос, немедленно свяжитесь с Генеральным секретарем.',
        footer: '&copy; 2026 Illuminati Global Oversight. Все права защищены. Конфиденциальная передача.',
        textCodePrefix: 'ВАШ 6-ЗНАЧНЫЙ КОД ПОДТВЕРЖДЕНИЯ:',
        textIgnoreNotice: 'Если вы не запрашивали этот код, обратитесь в службу поддержки или проигнорируйте это сообщение.',
        purposes: {
            login: {
                subject: 'Портал Иллюминатов - Код Проверки Безопасности',
                headline: 'Проверка Безопасности',
                description: 'Введите этот 6-значный код для авторизации доступа к вашему аккаунту Elite.'
            },
            device: {
                subject: 'Портал Иллюминатов - Проверка Неопознанного Браузера',
                headline: 'Обнаружен Новый Браузер',
                description: 'Обнаружена попытка входа в систему или доступа с неизвестного браузера или устройства. Введите 6-значный код авторизации ниже, чтобы подтвердить свою личность:'
            },
            payment: {
                subject: 'Портал Иллюминатов - Проверка Способа Выплат',
                headline: 'Верификация Платежного Шлюза',
                description: 'Вы привязываете или обновляете канал платежного шлюза в Глобальном реестре. Пожалуйста, подтвердите это изменение 6-значным кодом ниже:'
            },
            approval: {
                subject: 'Портал Иллюминатов - Членство Одобрено и Код Доступа',
                headline: 'Аккаунт Одобрен - Добро пожаловать',
                description: 'Ваше членство официально одобрено Генеральным секретарем. Чтобы разблокировать и войти в Панель управления Elite, введите 6-значный код авторизации ниже:'
            }
        }
    },
    ar: {
        headerSubtitle: 'التحقق من أمان حساب النخبة',
        validityHtml: 'رمز المرور لمرة واحدة هذا صالح لمدة <strong>10 دقائق</strong>.',
        validityText: 'تنتهي صلاحية هذا الرمز خلال 10 دقائق.',
        securityNoticeHtml: '<strong>إشعار أمني:</strong> إذا لم تقم ببدء هذا الطلب أو الوصول إلى حساب النخبة الخاص بك، يرجى الاتصال بالأمين العام فوراً.',
        securityNoticeText: 'إشعار أمني: إذا لم تقم ببدء هذا الطلب، يرجى الاتصال بالأمين العام فوراً.',
        footer: '&copy; 2026 Illuminati Global Oversight. جميع الحقوق محفوظة. إرسال سري.',
        textCodePrefix: 'رمز التحقق المكون من 6 أرقام الخاص بك:',
        textIgnoreNotice: 'إذا لم تطلب هذا الرمز، يرجى الاتصال بالدعم أو تجاهل هذه الرسالة.',
        purposes: {
            login: {
                subject: 'بوابة المتنورين - رمز التحقق الأمني',
                headline: 'التحقق الأمني',
                description: 'أدخل هذا الرمز المكون من 6 أرقام لتفويض الوصول إلى حساب النخبة الخاص بك.'
            },
            device: {
                subject: 'بوابة المتنورين - التحقق من متصفح غير معروف',
                headline: 'تم اكتشاف متصفح جديد',
                description: 'تم اكتشاف محاولة تسجيل دخول أو وصول من متصفح أو جهاز غير معروف. أدخل رمز التفويض المكون من 6 أرقام أدناه للتحقق من هويتك:'
            },
            payment: {
                subject: 'بوابة المتنورين - التحقق الأمني من طريقة الدفع',
                headline: 'التحقق من بوابة الدفع',
                description: 'أنت تقوم بربط أو تحديث قناة بوابة الدفع في السجل العالمي. يرجى تأكيد هذا التغيير بالرمز المكون من 6 أرقام أدناه:'
            },
            approval: {
                subject: 'بوابة المتنورين - تمت الموافقة على العضوية ورمز الوصول',
                headline: 'تمت الموافقة على الحساب - مرحباً بك',
                description: 'تمت الموافقة على عضويتك رسمياً من قبل الأمين العام. لفتح لوحة تحكم النخبة والدخول إليها، يرجى إدخال رمز التفويض المكون من 6 أرقام أدناه:'
            }
        }
    }
};

function normalizeLanguage(lang) {
    if (!lang || typeof lang !== 'string') return 'en';
    const clean = lang.toLowerCase().trim().split('-')[0];
    if (lang.toLowerCase().startsWith('zh')) return 'zh';
    return emailDictionary[clean] ? clean : 'en';
}

exports.handler = async function (event, context) {
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let body = {};
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { action = 'send', email, purpose = 'login', code, token, language } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Valid email address is required' }) };
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const targetLang = normalizeLanguage(language);

    // -------------------------------------------------------------------------
    // ACTION: VERIFY CODE
    // -------------------------------------------------------------------------
    if (action === 'verify' || (code && code.length === 6 && !body.sender)) {
        if (!code || !/^\d{6}$/.test(String(code).trim())) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ success: false, error: 'Invalid 6-digit code format' })
            };
        }

        const trimmedCode = String(code).trim();
        let isValid = false;

        // 1. Verify via stateless HMAC token (cross-lambda safe)
        if (token && typeof token === 'string' && token.includes('.')) {
            const [tsStr, signature] = token.split('.');
            const timestamp = parseInt(tsStr, 10);
            const now = Date.now();

            if (!isNaN(timestamp) && (now - timestamp) <= (10 * 60 * 1000) && (now - timestamp) >= -30000) {
                const expectedSignature = generateHMAC(normalizedEmail, purpose, trimmedCode, timestamp);
                if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
                    isValid = true;
                }
            }
        }

        // 2. Check in-memory store fallback
        if (!isValid) {
            isValid = verifyInMemory(normalizedEmail, trimmedCode, purpose);
        }

        if (isValid) {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    verified: true,
                    message: 'Verification code verified successfully',
                    email: normalizedEmail,
                    purpose,
                    language: targetLang
                })
            };
        }

        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Invalid or expired verification code. Please request a new code.'
            })
        };
    }

    // -------------------------------------------------------------------------
    // ACTION: SEND VERIFICATION EMAIL (VIA BREVO API)
    // -------------------------------------------------------------------------
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!BREVO_API_KEY) {
        console.error('BREVO_API_KEY not configured in environment variables');
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Brevo email service not configured. Please set BREVO_API_KEY in Netlify settings.' })
        };
    }

    // Generate 6-digit code and token
    const generatedCode = generate6DigitCode();
    const timestamp = Date.now();
    const signature = generateHMAC(normalizedEmail, purpose, generatedCode, timestamp);
    const verificationToken = `${timestamp}.${signature}`;

    // Store in container memory fallback
    storeInMemory(normalizedEmail, generatedCode, purpose);

    // Resolve purpose key
    let purposeKey = 'login';
    if (purpose === 'payment') {
        purposeKey = 'payment';
    } else if (purpose === 'device' || purpose === 'browser') {
        purposeKey = 'device';
    } else if (purpose === 'approval') {
        purposeKey = 'approval';
    }

    // Retrieve localized copy from emailDictionary
    const langBlock = emailDictionary[targetLang] || emailDictionary.en;
    const purposeBlock = langBlock.purposes[purposeKey] || langBlock.purposes.login;

    const subject = purposeBlock.subject;
    const headline = purposeBlock.headline;
    const description = purposeBlock.description;
    const headerSubtitle = langBlock.headerSubtitle;
    const validityHtml = langBlock.validityHtml;
    const validityText = langBlock.validityText;
    const securityNoticeHtml = langBlock.securityNoticeHtml;
    const securityNoticeText = langBlock.securityNoticeText;
    const footerText = langBlock.footer;
    const textCodePrefix = langBlock.textCodePrefix;
    const textIgnoreNotice = langBlock.textIgnoreNotice;

    const isRtl = targetLang === 'ar';
    const dirAttr = isRtl ? 'dir="rtl"' : 'dir="ltr"';
    const noticeTextAlign = isRtl ? 'right' : 'left';
    const noticeBorderSide = isRtl ? 'border-right: 3px solid #d4af37;' : 'border-left: 3px solid #d4af37;';

    const htmlContent = `
        <!DOCTYPE html>
        <html ${dirAttr} lang="${targetLang}">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { background-color: #080808; color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; }
                .email-container { max-width: 580px; margin: 30px auto; background: #0f172a; border: 2px solid #d4af37; border-radius: 12px; overflow: hidden; box-shadow: 0 0 35px rgba(212, 175, 55, 0.25); }
                .header { background: linear-gradient(135deg, #0b0f19 0%, #1e293b 100%); padding: 30px 20px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.4); }
                .header h1 { color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
                .header p { color: #94a3b8; margin: 8px 0 0 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; }
                .content { padding: 35px 30px; text-align: center; }
                .content h2 { color: #f8fafc; font-size: 20px; margin-top: 0; margin-bottom: 15px; }
                .content p { color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 25px; }
                .code-box { background: #020617; border: 2px solid #d4af37; border-radius: 10px; padding: 18px 24px; display: inline-block; margin: 15px auto 25px auto; direction: ltr; }
                .code-text { font-size: 36px; font-weight: 800; color: #facc15; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; }
                .notice { background: rgba(212, 175, 55, 0.08); ${noticeBorderSide} padding: 12px 16px; text-align: ${noticeTextAlign}; margin: 25px 0 15px 0; border-radius: 4px; }
                .notice p { margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; }
                .footer { background: #080c14; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
            </style>
        </head>
        <body>
            <div class="email-container" ${dirAttr}>
                <div class="header">
                    <h1>ILLUMINATI OVERSIGHT</h1>
                    <p>${headerSubtitle}</p>
                </div>
                <div class="content">
                    <h2>${headline}</h2>
                    <p>${description}</p>
                    <div class="code-box">
                        <div class="code-text">${generatedCode}</div>
                    </div>
                    <p style="color: #94a3b8; font-size: 13px; margin-top: 10px;">
                        ${validityHtml}
                    </p>
                    <div class="notice">
                        <p>${securityNoticeHtml}</p>
                    </div>
                </div>
                <div class="footer">
                    ${footerText}
                </div>
            </div>
        </body>
        </html>
    `;

    const textContent = `ILLUMINATI OVERSIGHT - ${headerSubtitle}\n\n${headline}\n\n${description}\n\n${textCodePrefix} ${generatedCode}\n\n${validityText}\n\n${securityNoticeText}\n\n${textIgnoreNotice}\n\n${footerText.replace(/&copy;/g, '©')}`;

    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = 'Illuminati Portal';

    try {
        console.log(`[send-verification-email] Dispatching Brevo OTP email to ${normalizedEmail} (purpose: ${purpose}, language: ${targetLang})`);

        const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: senderName, email: senderEmail },
                to: [{ email: normalizedEmail }],
                subject,
                htmlContent,
                textContent
            })
        });

        const responseData = await brevoResponse.json().catch(() => ({}));

        if (!brevoResponse.ok) {
            console.error('Brevo API error response:', responseData);
            return {
                statusCode: brevoResponse.status,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Failed to send verification email via Brevo',
                    details: responseData
                })
            };
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: 'Verification code sent successfully',
                token: verificationToken,
                expiresIn: 600,
                email: normalizedEmail,
                purpose,
                language: targetLang
            })
        };
    } catch (err) {
        console.error('Network or execution error sending email:', err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to dispatch email', message: err.message })
        };
    }
};
