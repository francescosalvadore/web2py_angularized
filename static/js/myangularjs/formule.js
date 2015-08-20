// E = assunzione cronica giornaliera del contaminante
// SF (Slope Factor) rappresenta la probabilità di casi incrementali di tumore 
// RfD (Reference Dose) rappresenta la stima dell’esposizione media giornaliera a sostanze non cancerogene
// che non produce effetti avversi apprezzabili sull’organismo umano durante il corso della vita.
// Rischio per le sostanze cancerogene
R = E * SF
// Indice di pericolo per le sostanze non cancerogene
HI = E / RfD
// Cpoe concentrazione calcolata in corrispondenza del punto di esposizione 
// EM portata effettiva di esposizione
E = C_poe * EM
// CRS rappresenta la concentrazione in sorgente e FT e il fattore di trasporto
C_poe = FT * CRS

// Riassumendo
R = FT * CRS * EM * SF
HI = FT * CRS * EM / RfD

// Ingestione suolo (no off-site)
R_SS_IngS = CRS * SF_Ing * EM_IngS * 10.e-6;
HI_SS_IngS = CRS * EM_IngS * 10.e-6 / RfD_Ing;
// Contatto dermico (no off-site)
R_SS_ConD = CRS * SF_Ing * EM_ConD * 10.e-6;
HI_SS_ConD = CRS * EM_ConD * 10.e-6 / RfD_Ing;
// Inalazione di vapori outdoor
R_SS_InaO = CRS * SF_Ina * EM_InaO * VF_ss *ADF
HI_SS_InaO = CRS * EM_InaO * VF_SS * ADF / RfD_Ina
// Inalazione particolato outdoor
R_SS_InaOP = CRS * SF_Ina * EM_InaO * PEF * ADF
HI_SS_InaOP = CRS * EM_InaO * PEF * ADF / RfD_Ina
// Cumulativo Outdoor
R_SS_outdoor = R_SS_IngS + R_SS_ConD + R_SS_InaO + R_SS_InaOP
HI_SS_outdoor = HI_SS_IngS + HI_SS_ConD + HI_SS_InaO + HI_SS_InaOP
// Inalazione di vapori indoor (no off-site)
R_SS_InaI = CRS * SF_Ina * EM_InaI * VF_ssesp
HI_SS_InaI = CRS * EM_InaI * VF_ssesp / RfD_Ina
// Inalazione particolato indoor (no off-site) 
R_SS_InaIP = CRS * SF_Ina * EM_InaI * PEF_in
HI_SS_InaIP = CRS * EM_InaI * PEF_in / RfD_Ina
// Cumulativo Indoor
R_SS_Indoor = R_SS_InaI + R_SS_InaIP
HI_SS_Indoor = HI_SS_InaI + HI_SS_InaIP
// Ingestione di acqua per lisciviazione
R_SS_LF = CRS * SF_Ing * EM_IngW * LF_ss / DAF
HI_SS_LF = CRS * EM_IngW * LF_ss / (RfD_Ing * DAF)
// Rischio e Indice di Pericolo Suolo superficiale
R_SS = Math.max(R_SS_outdoor, R_SS_Indoor, R_SS_LF)
HI_SS = Math.max(HI_SS_outdoor, HI_SS_Indoor, HI_SS_LF)

// Tabella 19
VF_ss_1 = 2 * W_p * rho_s / (U_air * delta_air) * Math.sqrt(D_s_eff * H / (pi * tau_outdoor * (theta_w + K_s * rho_s + H * theta_a))) * 1000.
VF_ss_2 = W_p * rho_s * d / (U_air * delta_air * tau_outdoor) * 1000.
VF_ss = Math.min(VF_ss_1 , VF_ss_2)

// Tabella 20
alpha_samb_SS = 1 / (1+ (U_air * delta_air * L_sg_SS)/(D_s_eff * W_p))

// Tabella 21
Q_s = (2 * pi * Delta_p*k_v*X_crack)/(mu_air * Math.log((2*Z_crack*X_crack)/(A_b*eta)))
csi = Q_s * L_crack / (D_crack_eff * A_b * eta)
if(Delta_p == 0) {
VF_ssesp_1 = (H * rho_s / (theta_w + K_s*rho_s + H*theta_a) * D_s_eff / ((L_s_SS - Z_crack) * L_b * ER))/(1+D_s_eff/((L_s_SS - Z_crack)*L_b* ER)+D_s_eff*L_crack/(D_crack_eff * eta * (L_s_SS - Z_crack))) * 1000.
} else {
VF_ssesp_1 = (H * rho_s / (theta_w + K_s*rho_s + H*theta_a) * D_s_eff / ((L_s_SS - Z_crack) * L_b * ER))*Math.exp(csi)/(Math.exp(csi)+D_s_eff/((L_s_SS - Z_crack)*L_b* ER)+D_s_eff*A_b/(Q_s * (L_s_SS - Z_crack))*(Math.exp(csi)-1)) * 1000.
}
VF_ssesp_2 = rho_s * d / (L_b * ER * tau_indoor) * 1000.
VF_ssesp = min(VF_ssesp_1 , VF_ssesp_2)	

// Tabella 22
if(Delta_p == 0) {
    alpha_ssesp = (D_s_eff/((L_sg_SS - Z_crack)*L_b*ER))/(1+(D_s_eff/((L_sg_SS-Z_crack)*L_b*ER))+(D_s_eff*L_crack)/(D_crack_eff*eta*(L_sg_SS-Z_crack)))
} else { 
	alpha_ssesp = (D_s_eff*Math.exp(csi)/((L_sg_SS - Z_crack)*L_b*ER))/(Math.exp(csi)+(D_s_eff/((L_sg_SS-Z_crack)*L_b*ER))+(D_s_eff*A_b*(Math.exp(csi)-1))/(Q_s*(L_sg_SS-Z_crack)))
}

// Tabella 23
LF_1 =  K_ws*SAM/LDF
LF_2 = d*rho_s/(I_eff*tau_LF)
LF = Math.min(LF_1,LF_2)
SAM = d / (L_gw-L_s_SS)
LDF = 1+(v_gw*delta_gw)/(I_eff*W)
K_ws = (rho_s)/(theta_w+K_s*rho_s+H_theta_a)
if(composti_inorganici) {
	K_s = K_d
} else {
	K_s = K_oc * f_oc
}
delta_gw = Math.sqrt(2*0.0056*W*W)+d_a*(1-Math.exp(-W*I_eff/(v_gw*d_a)))

// Tabella 24
PEF = (P_e * W_p)/(U_air * delta_air) * 1000.
PEF_in = PEF * F_i;
// Tabella 25
Q = U_air * delta_air * S_w
ADF = Q / (2*pi * U_air * sigma_y * sigma_z)*2*Math.exp(-0.5*delta_air*delta_air/(sigma_z*sigma_z))
// Tabella 26

// Tabella 27

// Tabella 43
EM = (SA*AF*ABS*EF*ED)/(BW*AT*365)
EM = (IR*FI*EF*ED)/(BW*AT*365)
EM = (B_0*EF_go*EF*ED)/(BW*AT*365)
EM = (B_i*EF_gi*EF*ED)/(BW*AT*365)
EM = (IR_W*EF*ED)/(BW*AT*365)
if(sostanze_cancerogene) {
    EM_adj =EM_bambino + EM_adulto;
} else {
    EM_bambino;
}

