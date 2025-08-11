// Mock telephony service simulating Twilio Voice API
export interface IncomingCall {
  id: string;
  customerName: string;
  phoneNumber: string;
  timestamp: Date;
  purpose?: string;
}

export interface OutgoingCall {
  id: string;
  phoneNumber: string;
  agentId: string;
  timestamp: Date;
}

class MockTelephonyService {
  private incomingCallQueue: IncomingCall[] = [];
  private activeCallsMap: Map<string, any> = new Map();
  private callListeners: ((call: IncomingCall) => void)[] = [];

  constructor() {
    this.simulateIncomingCalls();
  }

  private simulateIncomingCalls() {
    const mockCallers = [
      { name: "Sarah Johnson", number: "+1 (555) 123-4567", purpose: "Booking appointment" },
      { name: "Mike Chen", number: "+1 (555) 987-6543", purpose: "Technical support" },
      { name: "Emma Davis", number: "+1 (555) 456-7890", purpose: "General inquiry" },
      { name: "Robert Smith", number: "+1 (555) 111-2222", purpose: "Follow-up call" },
      { name: "Lisa Anderson", number: "+1 (555) 333-4444", purpose: "Billing question" },
      { name: "David Wilson", number: "+1 (555) 555-6666", purpose: "Service request" },
    ];

    // Simulate incoming calls every 30-120 seconds
    const scheduleNextCall = () => {
      const delay = Math.random() * 90000 + 30000; // 30-120 seconds
      setTimeout(() => {
        const caller = mockCallers[Math.floor(Math.random() * mockCallers.length)];
        const incomingCall: IncomingCall = {
          id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customerName: caller.name,
          phoneNumber: caller.number,
          purpose: caller.purpose,
          timestamp: new Date(),
        };

        this.incomingCallQueue.push(incomingCall);
        this.notifyCallListeners(incomingCall);
        scheduleNextCall();
      }, delay);
    };

    scheduleNextCall();
  }

  private notifyCallListeners(call: IncomingCall) {
    this.callListeners.forEach(listener => listener(call));
  }

  public onIncomingCall(listener: (call: IncomingCall) => void) {
    this.callListeners.push(listener);
  }

  public removeCallListener(listener: (call: IncomingCall) => void) {
    const index = this.callListeners.indexOf(listener);
    if (index > -1) {
      this.callListeners.splice(index, 1);
    }
  }

  public answerCall(callId: string, agentId?: string): boolean {
    const callIndex = this.incomingCallQueue.findIndex(call => call.id === callId);
    if (callIndex === -1) return false;

    const call = this.incomingCallQueue.splice(callIndex, 1)[0];
    this.activeCallsMap.set(callId, {
      ...call,
      startTime: new Date(),
      agentId: agentId || 'ai',
      status: 'active',
    });

    return true;
  }

  public endCall(callId: string): boolean {
    if (!this.activeCallsMap.has(callId)) return false;

    const call = this.activeCallsMap.get(callId);
    call.endTime = new Date();
    call.duration = Math.floor((call.endTime.getTime() - call.startTime.getTime()) / 1000);
    call.status = 'completed';

    this.activeCallsMap.delete(callId);
    return true;
  }

  public transferCall(callId: string, toAgentId: string): boolean {
    const call = this.activeCallsMap.get(callId);
    if (!call) return false;

    call.agentId = toAgentId;
    call.transferTime = new Date();
    return true;
  }

  public getQueuedCalls(): IncomingCall[] {
    return [...this.incomingCallQueue];
  }

  public getActiveCalls() {
    return Array.from(this.activeCallsMap.values());
  }

  public makeOutboundCall(phoneNumber: string, agentId: string): string {
    const callId = `out_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.activeCallsMap.set(callId, {
      id: callId,
      phoneNumber,
      agentId,
      startTime: new Date(),
      status: 'active',
      type: 'outbound',
    });

    return callId;
  }
}

export const telephonyService = new MockTelephonyService();
