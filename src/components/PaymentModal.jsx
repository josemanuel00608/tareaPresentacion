import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './PaymentModal.css';

function PaymentModal({ isOpen, onClose, course }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { user } = useAuth();

  const qrCodeData = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMzAgMjMwIj48ZGVmcz48c3R5bGU+LmF7ZmlsbDojMDAwO30uYntmaWxsOiNmZmY7fTwvc3R5bGU+PC9kZWZzPjxyZWN0IGNsYXNzPSJiIiB3aWR0aD0iMjMwIiBoZWlnaHQ9IjIzMCIvPjxyZWN0IGNsYXNzPSJhIiB4PSIxMCIgeT0iMTAiIHdpZHRoPSI3MCIgaGVpZ2h0PSI3MCIvPjxyZWN0IGNsYXNzPSJiIiB4PSIyMCIgeT0iMjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIvPjxyZWN0IGNsYXNzPSJhIiB4PSIzMCIgeT0iMzAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIvPjxyZWN0IGNsYXNzPSJhIiB4PSIxNTAiIHk9IjEwIiB3aWR0aD0iNzAiIGhlaWdodD0iNzAiLz48cmVjdCBjbGFzcz0iYiIgeD0iMTYwIiB5PSIyMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIi8+PHJlY3QgY2xhc3M9ImEiIHg9IjE3MCIgeT0iMzAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIvPjxyZWN0IGNsYXNzPSJhIiB4PSIxMCIgeT0iMTUwIiB3aWR0aD0iNzAiIGhlaWdodD0iNzAiLz48cmVjdCBjbGFzcz0iYiIgeD0iMjAiIHk9IjE2MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIi8+PHJlY3QgY2xhc3M9ImEiIHg9IjMwIiB5PSIxNzAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIvPjxyZWN0IGNsYXNzPSJhIiB4PSI5MCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPjxyZWN0IGNsYXNzPSJhIiB4PSIxMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz48cmVjdCBjbGFzcz0iYSIgeD0iMTMwIiB5PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+PC9zdmc+';

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  async function fetchPaymentMethods() {
    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true);
    if (data) setPaymentMethods(data);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentProof(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      let proofUrl = '';

      if (paymentProof) {
        const fileName = `${user.id}_${Date.now()}_${paymentProof.name}`;
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, paymentProof);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(fileName);
          proofUrl = publicUrl;
        }
      }

      const { error } = await supabase.from('purchases').insert({
        user_id: user.id,
        course_id: course.id,
        amount: course.price,
        payment_method: selectedMethod.method_type,
        payment_status: 'pending',
        payment_proof_url: proofUrl,
        verification_email_sent: false,
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error al procesar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Pago Enviado</h2>
            <p>Tu compra está siendo procesada. Recibirás una confirmación por correo una vez verificado el pago.</p>
          </div>
        ) : (
          <>
            <h2>Completar Compra</h2>
            <div className="course-summary">
              <h3>{course.title}</h3>
              <div className="price-display">${course.price.toLocaleString()}</div>
            </div>

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="payment-methods-grid">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`payment-method-card ${selectedMethod?.id === method.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedMethod(method);
                      if (method.method_type === 'qr') {
                        setShowQR(true);
                      } else {
                        setShowQR(false);
                      }
                    }}
                  >
                    <div className="method-header">
                      <input
                        type="radio"
                        name="payment-method"
                        checked={selectedMethod?.id === method.id}
                        onChange={() => setSelectedMethod(method)}
                      />
                      <h4>{method.method_name}</h4>
                    </div>
                    {selectedMethod?.id === method.id && (
                      <div className="method-details">
                        {method.method_type === 'qr' && showQR ? (
                          <div className="qr-display">
                            <img src={qrCodeData} alt="Código QR" className="qr-code-image" />
                            <p className="qr-info">Escanea este código QR para realizar el pago</p>
                          </div>
                        ) : (
                          <>
                            {method.account_number && (
                              <p className="account-info">
                                <strong>Número:</strong> {method.account_number}
                              </p>
                            )}
                            <p className="instructions">{method.instructions}</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedMethod && (
                <div className="proof-upload">
                  <label>
                    <strong>Subir Comprobante de Pago</strong>
                    <span className="optional">(Recomendado para verificación rápida)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  {paymentProof && (
                    <p className="file-name">Archivo: {paymentProof.name}</p>
                  )}
                </div>
              )}

              <div className="payment-info-box">
                <p>
                  <strong>Importante:</strong> Una vez realizado el pago, envía el comprobante a:
                </p>
                <p className="email-highlight">josemanuelloayzavaca7@gmail.com</p>
                <p>Tu curso será activado después de verificar el pago.</p>
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={!selectedMethod || loading}
              >
                {loading ? 'Procesando...' : 'Confirmar Compra'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;
