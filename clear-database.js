#!/usr/bin/env node

/**
 * Script pour vider la base de données ROTI
 * Usage: node clear-database.js
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chemin vers la base de données
const dbPath = join(__dirname, 'roti.db');

// Interface pour les questions utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function clearDatabase() {
  console.log('🗄️  Script de vidage de la base de données ROTI');
  console.log('=====================================\n');
  
  try {
    // Ouvrir la base de données
    const db = new Database(dbPath);
    
    // Vérifier le nombre d'enregistrements actuels
    const voteCount = db.prepare('SELECT COUNT(*) as count FROM votes').get();
    const sessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get();
    const adminSessionCount = db.prepare('SELECT COUNT(*) as count FROM admin_sessions').get();
    
    console.log(`📊 État actuel de la base de données :`);
    console.log(`   • Votes : ${voteCount.count}`);
    console.log(`   • Sessions utilisateur : ${sessionCount.count}`);
    console.log(`   • Sessions admin : ${adminSessionCount.count}\n`);
    
    if (voteCount.count === 0 && sessionCount.count === 0) {
      console.log('✅ La base de données est déjà vide !');
      rl.close();
      return;
    }
    
    // Demander confirmation
    const answer = await askQuestion('⚠️  Êtes-vous sûr de vouloir supprimer TOUS les votes et sessions ? (oui/non) : ');
    
    if (answer.toLowerCase() !== 'oui' && answer.toLowerCase() !== 'o' && answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('❌ Opération annulée.');
      rl.close();
      return;
    }
    
    console.log('\n🧹 Suppression des données en cours...');
    
    // Supprimer toutes les données
    const deleteVotes = db.prepare('DELETE FROM votes');
    const deleteSessions = db.prepare('DELETE FROM sessions');
    const deleteAdminSessions = db.prepare('DELETE FROM admin_sessions');
    
    // Exécuter les suppressions dans une transaction
    const deleteAll = db.transaction(() => {
      const votesDeleted = deleteVotes.run();
      const sessionsDeleted = deleteSessions.run();
      const adminSessionsDeleted = deleteAdminSessions.run();
      
      return {
        votes: votesDeleted.changes,
        sessions: sessionsDeleted.changes,
        adminSessions: adminSessionsDeleted.changes
      };
    });
    
    const result = deleteAll();
    
    console.log('\n✅ Suppression terminée !');
    console.log(`   • ${result.votes} votes supprimés`);
    console.log(`   • ${result.sessions} sessions utilisateur supprimées`);
    console.log(`   • ${result.adminSessions} sessions admin supprimées`);
    
    // Vérification finale
    const finalVoteCount = db.prepare('SELECT COUNT(*) as count FROM votes').get();
    const finalSessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get();
    
    if (finalVoteCount.count === 0 && finalSessionCount.count === 0) {
      console.log('\n🎉 La base de données a été vidée avec succès !');
      console.log('   Vous pouvez maintenant recommencer une nouvelle session de votes.');
    }
    
    // Fermer la base de données
    db.close();
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression :', error.message);
  } finally {
    rl.close();
  }
}

// Gestion des signaux pour fermer proprement
process.on('SIGINT', () => {
  console.log('\n\n❌ Opération interrompue par l\'utilisateur.');
  rl.close();
  process.exit(0);
});

// Exécuter le script
clearDatabase();
